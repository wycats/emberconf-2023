import Token from "markdown-it/lib/token.js";
import {
  MarkdownFragment,
  type Child,
  type LazyChild,
  type ToString,
} from "./tokens.js";

export type Falsy = null | undefined | false | 0 | "";

export function Fragment(...children: Child[]): LazyChild {
  return {
    render: (fragment) => fragment.push(...children),
  };
}

export function El(...args: Parameters<MarkdownFragment["el"]>): LazyChild {
  return {
    render: (fragment) => fragment.el(...args),
  };
}

export function BlockHtml(text: ToString): LazyChild {
  return {
    render: (fragment) => fragment.blockHtml(text),
  };
}

export function InlineHtml(text: ToString): LazyChild {
  return {
    render: (fragment) => fragment.inlineHtml(String(text)),
  };
}

export function HtmlEl(...args: Parameters<MarkdownFragment["el"]>): LazyChild {
  return {
    render: (fragment) => fragment.htmlEl(...args),
  };
}

export function Do(then: () => LazyChild[]): LazyChild {
  return {
    render: (fragment) => render(fragment, then()),
  };
}

export function Let<T>(
  values: T,
  then: (values: T) => LazyChildren
): LazyChild {
  return {
    render: (fragment) => render(fragment, then(values)),
  };
}

export function If<T>(
  condition: T,
  then: (value: Exclude<T, Falsy>) => LazyChildren,
  options?: {
    else: () => LazyChildren;
  }
): LazyChild {
  return {
    render: (fragment) => {
      if (condition) {
        return render(fragment, then(condition as Exclude<T, Falsy>));
      } else if (options?.else) {
        return render(fragment, options.else());
      } else {
        return fragment;
      }
    },
  } satisfies LazyChild;
}

export function HTML(value: string): LazyChild {
  const html = new Token("html_block", value, 0);
  html.content = value;
  return {
    render: (tokens) => tokens.append(html),
  };
}

export type LazyChildren = LazyChild | LazyChild[];

function render(
  fragment: MarkdownFragment,
  children: LazyChildren
): MarkdownFragment {
  if (Array.isArray(children)) {
    for (const child of children) {
      child.render(fragment);
    }
  } else {
    children.render(fragment);
  }
  return fragment;
}
