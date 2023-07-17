import MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.js";
import type { StateBlock, TypedBlockState } from "./types.js";

export class MDStateCreator<Env, WrapperEnv> {
  readonly #md: MarkdownIt;
  readonly #createEnv: (env: Env) => WrapperEnv;

  constructor(
    md: MarkdownIt,
    createEnv: (env: Env) => WrapperEnv
  ) {
    this.#md = md;
    this.#createEnv = createEnv;
  }

  create(state: TypedBlockState<Env>): MDState<WrapperEnv> {
    return new MDState(
      this.#md,
      state,
      this.#createEnv(state.env)
    );
  }
}

export class MDState<Env = unknown> {
  readonly #state: TypedBlockState<Env>;
  readonly #md: MarkdownIt;
  readonly #env: Env;

  constructor(md: MarkdownIt, state: StateBlock, env: Env) {
    this.#state = state;
    this.#md = md;
    this.#env = env;
  }

  line(lineno: number): LineState {
    return new LineState(this.#state, lineno);
  }

  consumeLine(): void {
    this.#state.line = this.#state.line + 1;
  }

  get highlight(): HighlightFn | null | undefined {
    return this.#md.options.highlight;
  }

  get md(): MarkdownIt {
    return this.#md;
  }

  get env(): Env {
    return this.#env;
  }

  open() {
    return this.#state.push("html_block", "", 0);
  }

  renderHTML(content: string) {
    return this.#md.render(content, this.#state.env);
  }

  renderInline(content: string) {
    return this.#md.renderInline(content, this.#state.env);
  }

  parse(content: string) {
    const tokens: Token[] = [];
    this.#md.block.parse(content, this.#md, this.#env, tokens);
    return tokens;
  }

  parseInline(content: string) {
    const tokens: Token[] = [];
    this.#md.inline.parse(content, this.#md, this.#env, tokens);
    return tokens;
  }

  error(message: string) {
    return `<div class="language-error ext-error"><pre class="ext-error"><code>${message}</code></pre></div>`;
  }
}

export type HighlightFn = (
  str: string,
  lang: string,
  attrs: string
) => string;

export class LineState {
  #state: StateBlock;
  #startLine: number;

  constructor(state: StateBlock, startLine: number) {
    this.#state = state;
    this.#startLine = startLine;
  }

  get state(): StateBlock {
    return this.#state;
  }

  get next(): LineState | undefined {
    if (this.#startLine < this.#state.lineMax) {
      return new LineState(this.#state, this.#startLine + 1);
    } else {
      return undefined;
    }
  }

  get position(): { pos: number; max: number } {
    return {
      pos: this.contentStart,
      max: this.end,
    };
  }

  get #src(): string {
    return this.#state.src;
  }

  get rest() {
    return this.#state.src.slice(this.start);
  }

  consume(): LineState {
    this.#state.line = this.#startLine + 1;
    return new LineState(this.#state, this.#startLine + 1);
  }

  until(predicate: (line: LineState) => boolean): string {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let line: LineState | undefined = this;
    const lines = [];

    while (line) {
      const next: LineState | undefined = line.next;

      if (!next) {
        this.#state.line = line.#startLine + 1;
        break;
      }

      lines.push(line.string({ ws: true }));
      line = next;

      if (predicate(next)) {
        this.#state.line = next.#startLine + 1;
        break;
      }
    }

    return lines.join("\n");
  }

  string({ ws = false }: { ws?: boolean } = {}): string {
    return this.#src.slice(
      ws ? this.start : this.contentStart,
      this.end
    );
  }

  startsWith(chars: string): boolean {
    return this.slice(chars.length) === chars;
  }

  matchStart(
    regex: RegExp
  ):
    | { type: "unmatched" }
    | { type: "match"; raw: RegExpExecArray; fragment: string }
    | { type: "error"; error: string } {
    if (!regex.source.startsWith("^")) {
      return {
        type: "error",
        error: `invalid pattern for matchStart (${regex}). matchStart patterns must be anchored`,
      };
    }

    const match = regex.exec(this.rest);

    if (!match) {
      return { type: "unmatched" };
    } else {
      return {
        type: "match",
        raw: match,
        fragment: match[0],
      };
    }
  }

  slice(
    n: number = this.end - this.contentStart
  ): string | undefined {
    if (n > this.end - this.contentStart) {
      return undefined;
    }

    const pos = this.contentStart;
    let chars = "";

    for (let i = 0; i < n; ++i) {
      chars += this.#src.charAt(pos + i);
    }

    return chars;
  }

  /**
   * The total indent of the line, including the required indent.
   */
  get #totalIndent(): number {
    return this.#state.sCount[this.#startLine] ?? 0;
  }

  /**
   * The required indent of the line.
   */
  get #requiredIndent(): number {
    return this.#state.blkIndent;
  }

  /**
   * The indent of the line, excluding the required indent.
   */
  get indent(): number {
    return this.#totalIndent - this.#requiredIndent;
  }

  /**
   * if it's indented more than 3 spaces, it's a code block
   */
  get isCodeBlock(): boolean {
    return this.indent >= 4;
  }

  get start(): number {
    return this.#state.bMarks[this.#startLine] ?? 0;
  }

  get wsChars(): number {
    return this.#state.tShift[this.#startLine] ?? 0;
  }

  get contentStart(): number {
    return this.start + this.wsChars;
  }

  get end(): number {
    return this.#state.eMarks[this.#startLine] ?? 0;
  }
}

export function position(
  state: StateBlock,
  startLine: number
): { pos: number; max: number } {
  const pos =
    (state.bMarks[startLine] ?? 0) +
    (state.tShift[startLine] ?? 0);
  const max = state.eMarks[startLine] ?? 0;

  return { pos, max };
}
