import type { PluginHelper } from "@jsergo/mdit";
import Token from "markdown-it/lib/token.js";

export type SingleAttrValue = AttrPart | boolean;
export type AttrPart = string | number | null | undefined;
export type AttrValue =
  | SingleAttrValue
  | AttrPart[]
  | Record<keyof any, SingleAttrValue>;

export class CustomBuiltin {
  readonly #md: PluginHelper;

  constructor(md: PluginHelper) {
    this.#md = md;
  }

  el(
    tag: string,
    attrs: Record<string, AttrValue>,
    children: Child[]
  ): MarkdownElement {
    return ParagraphElement.tag(tag, this.#md)
      .attrs(attrs)
      .push(...children);
  }
}

export abstract class MarkdownFragment implements LazyChild {
  abstract done(): Token[];
  protected abstract appendToken(token: Token): void;

  #md: PluginHelper;

  constructor(md: PluginHelper) {
    this.#md = md;
  }

  render(tokens: MarkdownFragment): MarkdownFragment {
    return tokens.push(...this.done());
  }

  protected get md(): PluginHelper {
    return this.#md;
  }

  blockHtml(markdown: ToString): this {
    this.push(...this.md.parseBlock(ToString(markdown)));
    return this;
  }

  inlineHtml(markdown: ToString): this {
    this.push(...this.md.parseInline(ToString(markdown)));
    return this;
  }

  append(child: Child): this {
    if (child === undefined || child === null) {
      // do nothing
    } else if (typeof child === "string") {
      this.appendToken(text(child));
    } else if ("render" in child) {
      child.render(this);
    } else {
      this.appendToken(child);
    }

    return this;
  }

  push(...children: Child[]): this {
    for (const child of children) {
      this.append(child);
    }
    return this;
  }

  element(
    {
      tag,
      attrs,
      children,
    }: {
      tag: string;
      attrs: Record<string, AttrValue>;
      children: Children | undefined;
    },
    {
      create,
    }: {
      create: {
        tag: (tag: string, md: PluginHelper) => MarkdownElement;
      };
    }
  ): this {
    let el = create.tag(tag, this.md).attrs(attrs);

    if (Array.isArray(children)) {
      for (const child of children) {
        el.append(child);
      }
    } else if (typeof children === "function") {
      children(this);
    }

    this.push(...el.done());

    return this;
  }

  htmlEl(...elArgs: ElArgs): this {
    return this.element(normalizeElArgs(elArgs), {
      create: HtmlElement,
    });
  }

  el(...elArgs: ElArgs): this {
    return this.element(normalizeElArgs(elArgs), {
      create: ParagraphElement,
    });
  }
}

export abstract class MarkdownElement extends MarkdownFragment {
  abstract attr(key: string, value: AttrValue): this;

  constructor(_tag: string, md: PluginHelper) {
    super(md);
  }

  attrs(attrs: Record<string, AttrValue>): this {
    for (const [key, value] of Object.entries(attrs)) {
      this.attr(key, value);
    }
    return this;
  }

  renderInline(text: string): string {
    return this.md.renderInline(text);
  }
}

export class BasicFragment extends MarkdownFragment {
  static empty(md: PluginHelper): MarkdownFragment {
    return new BasicFragment(md);
  }

  readonly #tokens: Token[] = [];

  protected override appendToken(token: Token): void {
    this.#tokens.push(token);
  }

  override done(): Token[] {
    return this.#tokens;
  }
}

export class HtmlElement extends MarkdownElement {
  static tag(tag: string, md: PluginHelper): MarkdownElement {
    return new HtmlElement(tag, md);
  }

  readonly #tag: string;
  #open: string;
  readonly #children: Token[] = [];

  private constructor(tag: string, md: PluginHelper) {
    super(tag, md);
    this.#tag = tag;

    this.#open = `<${this.#tag}`;
  }

  override attr(key: string, value: AttrValue): this {
    const valueString = this.#attrValue(value);

    if (valueString !== null) {
      this.#open += ` ${key}=${valueString}`;
    }

    return this;
  }

  #attrValue(value: AttrValue): string | null {
    if (Array.isArray(value)) {
      return `"${value.join(" ")}`;
    } else if (typeof value === "string") {
      return JSON.stringify(value);
    } else if (typeof value === "number") {
      return `"${value}"`;
    } else if (value === true) {
      return `""`;
    } else {
      return null;
    }
  }

  override done(): Token[] {
    const open = new Token("html_block", "", 0);
    open.content = `${this.#open}\n\n`;
    const tokens: Token[] = [open];
    tokens.push(...this.#children);

    const close = new Token("html_block", "", 0);
    close.content = `\n\n</${this.#tag}>`;
    tokens.push(close);

    return tokens;
  }

  protected override appendToken(token: Token): void {
    if (!this.#open.endsWith(">")) this.#open += ">";

    this.#children.push(token);
  }
}

export class ParagraphElement extends MarkdownElement {
  static tag(tag: string, md: PluginHelper): ParagraphElement {
    return new ParagraphElement(
      md,
      tag,
      new Token("paragraph_open", tag, 1),
      []
    );
  }

  readonly #tag: string;
  readonly #token: Token;
  readonly #children: Token[];

  private constructor(
    md: PluginHelper,
    tag: string,
    token: Token,
    children: Token[]
  ) {
    super(tag, md);
    this.#tag = tag;
    this.#token = token;
    this.#children = children;
  }

  protected override appendToken(token: Token): void {
    this.#children.push(token);
  }

  done(): Token[] {
    return [
      this.#token,
      ...this.#children,
      new Token("paragraph_close", this.#tag, -1),
    ];
  }

  attr(name: string, value: AttrValue): this {
    if (value === undefined || value === false) {
      // do nothing
    } else if (Array.isArray(value)) {
      for (const val of attrListValue(value)) {
        this.#token.attrJoin(name, val);
      }
    } else if (typeof value === "object") {
    } else if (value === true) {
      this.#token.attrSet(name, "");
    } else if (value) {
      const val = attrPart(value);
      if (val) {
        this.#token.attrSet(name, val);
      }
    }

    return this;
  }
}

export type Child = LazyChild | Token | string | null | undefined;

export type Children = Child[] | ((el: MarkdownFragment) => MarkdownFragment);

export interface LazyChild {
  render(tokens: MarkdownFragment): MarkdownFragment;
}

export interface TextLike {
  stringify(): string;
}

export type ToString = TextLike | string | number | boolean;

function ToString(stringlike: ToString): string {
  if (typeof stringlike !== "object") {
    return String(stringlike);
  } else {
    return stringlike.stringify();
  }
}

export function text(string: ToString): Token {
  const token = new Token("text", "", 0);
  token.content = ToString(string);
  return token;
}

export function fence(
  lang: string,
  content: string,
  options?: { highlights?: string[] | undefined }
): Token {
  const token = new Token("fence", "code", 0);
  token.info = options?.highlights
    ? `${lang} {${options.highlights.join(",")}}`
    : lang;
  token.markup = "```";
  token.content = content;
  token.block = true;
  console.log(token);
  return token;
}

function attrListValue(value: AttrPart[]) {
  return value
    .filter((v: AttrPart) => typeof v === "string" || typeof v === "number")
    .map(attrPart)
    .filter(isPresent);
}

function attrPart(value: AttrPart): string | undefined {
  if (value === undefined || value === null || typeof value === "object") {
    return undefined;
  } else if (typeof value === "number") {
    return String(value);
  } else if (typeof value === "string") {
    return value;
  } else {
    console.error(value);
    throw unreachable(value);
  }
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function unreachable(_value: never, message = "unreachable") {
  throw new Error(message);
}

type ElArgs = [
  tag: string,
  attrs?: Record<string, AttrValue> | Children | undefined,
  children?: Children,
];

function normalizeElArgs([tag, attrs, children]: ElArgs): {
  tag: string;
  attrs: Record<string, AttrValue>;
  children: Children | undefined;
} {
  if (
    attrs === undefined ||
    Array.isArray(attrs) ||
    typeof attrs === "function"
  ) {
    return { tag, attrs: {}, children: attrs };
  } else {
    return { tag, attrs, children };
  }
}
