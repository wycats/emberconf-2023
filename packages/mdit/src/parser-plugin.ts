import type MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.js";
import {
  MDState,
  MDStateCreator,
  type LineState,
} from "./state.js";
import type {
  RuleBlock,
  TypedBlockRule,
  TypedBlockState,
} from "./types.js";

type RenderedContent =
  | {
      readonly type: "html";
      readonly content: string;
    }
  | {
      readonly type: "tokens";
      readonly content: Token[];
    }
  | {
      readonly type: "empty";
    }
  | { readonly type: "reconsume" };

export class ReturnRendered {
  html(content: string): RenderedContent {
    return {
      type: "html",
      content,
    };
  }

  tokens(tokens: Token[]): RenderedContent {
    return {
      type: "tokens",
      content: tokens,
    };
  }

  empty(): RenderedContent {
    return {
      type: "empty",
    };
  }

  reconsume(): RenderedContent {
    return {
      type: "reconsume",
    };
  }
}

const RENDER = new ReturnRendered();

export class PluginHelper<Env = unknown> {
  readonly #state: MDState<Env>;

  constructor(state: MDState<Env>) {
    this.#state = state;
  }

  get md(): MarkdownIt {
    return this.#state.md;
  }

  get env(): unknown {
    return this.#state.env;
  }

  renderHTML(content: string): string {
    return this.#state.renderHTML(content);
  }

  renderInline(content: string): string {
    return this.#state.renderInline(content);
  }

  parseBlock(content: string): Token[] {
    return this.#state.parse(content);
  }

  parseInline(content: string): Token[] {
    return this.#state.parseInline(content);
  }

  error(message: string): string {
    return this.#state.error(message);
  }
}

export type BlockPlugin<Env> = (
  line: LineState,
  helper: PluginHelper<Env>
) => Consume | false | undefined;
export type Consume = () => Render | false | undefined;
export type Render = (render: ReturnRendered) => RenderedContent;

export type PluginInsertion =
  | {
      readonly name: string;
      readonly before: string;
    }
  | {
      readonly name: string;
      readonly after: string;
    }
  | {
      readonly replace: string;
    }
  | { readonly append: string };

export type PluginOptions<Env, WrapperEnv> = {
  readonly env?: (env: Env) => WrapperEnv;
} & PluginInsertion;

export function parserPlugin<Env, T = Env>(
  pluginOptions: PluginOptions<T, Env>
): {
  block: <Options>(
    plugin: BlockPlugin<Env>
  ) => MarkdownIt.PluginWithOptions<Options>;
} {
  const wrapEnv: (env: T) => Env =
    pluginOptions.env ?? ((env) => env as unknown as Env);

  return {
    block: <Options>(plugin: BlockPlugin<Env>) => {
      return (md: MarkdownIt, _options: Options) => {
        const createState = new MDStateCreator(md, wrapEnv);

        const parser: TypedBlockRule<T> = (
          state: TypedBlockState<T>,
          startLine,
          _endLine,
          silent
        ): boolean => {
          const mdState = createState.create(state);
          const line = mdState.line(startLine);

          if (line.isCodeBlock) {
            return false;
          }

          const consume = plugin(
            line,
            new PluginHelper(mdState)
          );

          if (!consume) {
            return false;
          }

          const render = consume();

          if (!render) {
            return false;
          }

          if (silent) {
            return true;
          }

          const rendered = render(RENDER);

          switch (rendered.type) {
            case "html": {
              const token = state.push("html_block", "", 0);
              token.content = rendered.content;
              return true;
            }
            case "tokens": {
              for (const token of rendered.content) {
                state.tokens.push(token);
              }
            }
            case "empty": {
              return true;
            }
            case "reconsume": {
              return false;
            }
          }
        };

        if ("before" in pluginOptions) {
          const { name, before } = pluginOptions;
          md.block.ruler.before(
            before,
            name,
            parser as RuleBlock
          );
        } else if ("after" in pluginOptions) {
          const { name, after } = pluginOptions;
          md.block.ruler.after(after, name, parser as RuleBlock);
        } else if ("replace" in pluginOptions) {
          const { replace } = pluginOptions;
          md.block.ruler.at(replace, parser as RuleBlock);
        } else if ("append" in pluginOptions) {
          const { append: name } = pluginOptions;
          md.block.ruler.push(name, parser as RuleBlock);
        }
      };
    },
  };
}
