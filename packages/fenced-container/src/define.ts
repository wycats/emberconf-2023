import type { PluginHelper } from "@jsergo/mdit";
import parseFence from "fenceparser";
import Token from "markdown-it/lib/token.js";
import { El, InlineHtml, type LazyChildren } from "./nodes.js";
import {
  BasicFragment,
  CustomBuiltin,
  MarkdownElement,
  type Children,
  type LazyChild,
  type TextLike,
} from "./tokens.js";
import { mapEntries } from "./utils.js";

type OBJECT = ReturnType<typeof parseFence>;
type VALUE = OBJECT[keyof OBJECT];
export const CUSTOM_EL = "CustomBlock";

interface RenderOptions {
  kind: string;
  /**
   * false means "leave out the title"
   * undefined means "use the default title"
   */
  title: Title;
  attrs: Record<string, VALUE>;
  content: UnparsedContent | undefined;
  highlights: string[] | undefined;
  md: PluginHelper;
}

export class UnparsedContent implements LazyChild {
  static of(content: string | undefined): UnparsedContent {
    return new UnparsedContent(content);
  }

  readonly #content: string | undefined;

  private constructor(content: string | undefined) {
    this.#content = content;
  }

  get raw(): string | undefined {
    return this.#content;
  }

  render(tokens: MarkdownElement): MarkdownElement {
    if (this.#content) {
      return tokens.blockHtml(this.#content);
    }
    return tokens;
  }
}

type RenderContainer = (options: {
  title: Title;
  kind: string;
  attrs: Record<string, VALUE>;
  highlights?: string[] | undefined;
  content: UnparsedContent | undefined;
  md: PluginHelper;
  define: CustomBuiltin;
}) => LazyChildren;

type BuiltinConfig =
  | {
      defaultTitle?: string | null | undefined;
      color: string;
    }
  | CustomConfig;

/**
 * A bare string is the default title.
 */
type BasicConfig =
  | {
      defaultTitle?: string | null | undefined;
      color?: string;
    }
  | string;

const DEFAULT_COLOR = "theme";

function ToBuiltinConfig(config: BasicConfig | undefined): BuiltinConfig {
  if (config === undefined || typeof config === "string") {
    return {
      defaultTitle: config ?? null,
      color: DEFAULT_COLOR,
    };
  } else {
    return {
      color: "theme",
      ...config,
    };
  }
}

interface CustomConfig {
  render: RenderContainer;
  options?: {} | undefined;
}

class Builtin {
  readonly #config: BuiltinConfig;

  constructor(config: BuiltinConfig) {
    this.#config = config;
  }

  render(options: RenderOptions): Token[] {
    const result = this.#renderFn({
      ...options,
      define: new CustomBuiltin(options.md),
    });

    const fragment = BasicFragment.empty(options.md);

    if (Array.isArray(result)) {
      fragment.push(...result);
    } else {
      fragment.push(result);
    }

    return fragment.done();
  }

  get #renderFn(): RenderContainer {
    if (typeof this.#config === "object" && "render" in this.#config) {
      return this.#config.render;
    }

    const color = this.#config.color;

    return ({ kind, title: providedTitle, content }) => {
      const title = providedTitle.withDefault(this.#defaultTitle ?? undefined);

      return CustomEl(
        kind,
        {
          color: color ?? DEFAULT_COLOR,
        },
        [
          title.map((t) =>
            El("p", { class: "custom-block-title" }, [InlineHtml(t)])
          ),
          content,
        ]
      );
    };
  }

  get #defaultTitle(): string | void {
    if (
      typeof this.#config === "object" &&
      "defaultTitle" in this.#config &&
      typeof this.#config.defaultTitle === "string"
    ) {
      return this.#config.defaultTitle;
    }
  }
}

export class Title implements LazyChild, TextLike {
  static provided(provided: string | false | undefined): Title {
    return new Title(provided, undefined);
  }

  static create(
    provided: string | false | undefined,
    defaultValue: string | undefined
  ): Title {
    return new Title(provided, defaultValue);
  }

  readonly #provided: string | undefined | false;
  readonly #default: string | undefined;

  private constructor(
    provided: string | false | undefined,
    defaultValue: string | undefined
  ) {
    this.#provided = provided;
    this.#default = defaultValue;
  }

  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `Title(${JSON.stringify(String(this))})`;
  }

  withDefault(defaultValue: string | undefined): Title {
    return new Title(this.#provided, defaultValue);
  }

  render(tokens: MarkdownElement): MarkdownElement {
    return tokens.append(InlineHtml(this));
  }

  isBlank(): boolean {
    return this.#provided === false;
  }

  map<T>(callback: (title: string) => T): T | null {
    const title = String(this);

    if (title === "") {
      return null;
    } else {
      return callback(title);
    }
  }

  exists(): boolean {
    if (this.#provided === false) {
      return false;
    } else if (this.#provided === undefined) {
      return this.#default !== undefined;
    } else {
      return true;
    }
  }

  get provided(): string | undefined | false {
    return this.#provided;
  }

  stringify(): string {
    if (this.#provided === false) {
      return "";
    } else if (this.#provided === undefined) {
      return this.#default ?? "";
    } else {
      return this.#provided;
    }
  }

  toString(): string {
    return this.stringify();
  }
}

export class Builtins<N extends string> {
  static empty(): Builtins<never> {
    return new Builtins({});
  }

  static from<N extends string>(config: Record<N, BuiltinConfig>) {
    return new Builtins(
      mapEntries(config, (config, name) => [name, new Builtin(config)])
    );
  }

  readonly #builtins: Record<N, Builtin>;

  constructor(builtins: Record<N, Builtin>) {
    this.#builtins = builtins;
  }

  custom<NewName extends string>(
    name: NewName,
    render: RenderContainer
  ): Builtins<N | NewName> {
    return new Builtins({
      ...this.#builtins,
      [name]: new Builtin({
        render,
      }),
    } as Record<N | NewName, Builtin>);
  }

  basic<NewName extends string>(
    name: NewName,
    config?: BasicConfig
  ): Builtins<N | NewName> {
    return new Builtins({
      ...this.#builtins,
      [name]: new Builtin(ToBuiltinConfig(config)),
    });
  }

  tryGet(name: string): Builtin | undefined {
    return (this.#builtins as Record<string, Builtin>)[name];
  }

  get(name: N): Builtin {
    return this.#builtins[name];
  }
}

export function styles(
  color: string,
  otherStyles: Record<string, string> = {}
) {
  return encode({
    ...namespaceStyle({
      "border-color": fg(color),
      fg: fg(color),
      bg: bg(color, "ultramuted"),
      "accent-fg": fg(color, "dim"),
      "accent-hover-bg": bg(color, "strong"),
      "code-border": fg(color, "muted"),
      "code-bg": bg(color, "muted"),
      "code-fg": bg(color, "dim"),
    }),
    ...otherStyles,
  });
}

export function namespaceStyle(styles: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(styles).map(([k, v]) => [
      `--sbdoc-block-${k}`,
      `var(--sb-${v})`,
    ])
  );
}

export function fg(color: string, style?: string) {
  if (style) {
    return `fg-${color}-${style}`;
  } else {
    return `fg-${color}`;
  }
}

export function bg(color: string, style?: string) {
  if (style) {
    return `bg-${color}-${style}`;
  } else {
    return `bg-${color}`;
  }
}

export function encode(
  attrs?: Record<string, string | number | boolean | null | undefined>
): string {
  if (attrs === undefined) {
    return "";
  }
  return JSON.stringify(attrs).replace(/\"/g, "'");
}

type BlockBorder = "n" | "s" | "ns" | "";
type InlineBorder = "e" | "w" | "ew" | "";
type Border = `${BlockBorder}${InlineBorder}`;

export function CustomEl(
  kind: string,
  options: {
    color: string;
    border?: Border;
    style?: Record<string, string>;
  },
  children?: Children
) {
  return El(
    CUSTOM_EL,
    {
      kind,
      border: options.border ?? "nsew",
      color: options.color,
      ":style": encode(options.style),
    },
    children
  );
}
