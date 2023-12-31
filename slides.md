---
theme: ./theme
background: https://source.unsplash.com/collection/94734566/1920x1080
css: unocss
highlighter: shiki
lineNumbers: true
colorSchema: dark
info: |
  ## EmberConf 2023
drawings:
  persist: false
transition: slide-left
title: EmberConf 2023
fonts:
  sans: "Open Sans"
  serif: "Playfair Display"
  mono: "mononoki Regular"
  local: "mononoki Regular"
layout: intro
---

# EmberConf 2023

---
layout: text-image
media: /yehuda-2006.jpg
caption: Baby Yehuda in 2006
---

# I started programming in 2004

::text::

#### Ruby and Rails changed my life.

- Empowering everyone
- No easy-bake ovens

<style lang="scss">
ul {
  @apply px-0;
}

ul li {
  @apply list-none;

  &::before {
    content: "🌟 "
  }
}
</style>

---
layout: intro
---

## Polaris is Coming

### Making Ember Healthy Again

What is Polaris? And why does it matter?


---
transition: fade-out
layout: intro
---

# What we'll cover today {.fancy}

- 🌟 What will programming in Polaris look like?
- 💭 Why do we care about making Ember better?

<style>
  ul {
    display: grid;
    justify-items: start;
    justify-content: center;
    row-gap: var(--s-base);
  }
  li {
    list-style-type: none;
    font-size: var(--s-up3);
  }
</style>

---
layout: intro
---

# Big Picture

<v-clicks depth="2">

1. `<template>`
2. Routing
3. TypeScript
4. Modern Tooling By Default
    - vite out of the box
    - vite plugins, optimized builds, etc. etc.
    - [**strong emphasis on zero-config shared tooling**]{.text-red}
{.fs-up3 .text-purple}

</v-clicks>

<style lang="scss">
  ol li code {
    color: inherit !important;
  }

  ol {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
  }

  ol li  {
    --current-hue: var(--hue-polaris);
    color: var(--color-mid);

    text-align: left;
    grid-column: 2;
    font-size: var(--s-up4);

    &::marker {
      --current-hue: var(--hue-polaris);
      color: var(--color-normal);
    }
  }

  ol li li {
    color: revert;
  }
</style>

---
layout: section
---

# Why Is Ember Here

## Really: Why We're <u>Still</u> Here {v-click}

> <u>HINT:</u> It has something to do with our apps, which are also still here.
{.emphasize .header content="🔎" v-click}

<style>
  :deep(.section-grid) {
    grid-template-rows: 1fr 1fr max-content;
  }
</style>

---
layout: two-cols
clicks: 2
---

# `<template>` {.text-center}

::a::

### Octane Colocation {.not-prose .octane}

<TheConsole title="counter.ts">

```ts {all|5|none} {at:0}
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

class Counter extends Component {
  @tracked count = 0; // [!code hl]
  increment = () => this.count++;
}
```

</TheConsole>

<TheConsole title="counter.hbs">

```hbs {none|none|all} {at:0}
<p>{{this.count}}</p>
<button {{on "click" this.increment}}>
  increment
</button>
```

</TheConsole>


::b::

### Polaris `<template>` {.not-prose .polaris}

<TheConsole title="counter.gjs">

```ts {all|5|8-14} {at:0}
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

class Counter extends Component {
  @tracked accessor count = 0; // [!code hl]
  increment = () => this.count++; 

  <template> // [!code focus:6]
    <p>{{this.count}}</p>
    <button {{on "click" this.increment}}>
      increment
    </button>
  </template>
}
```

</TheConsole>

---
layout: text-code
---

# Inline Helpers

::a::

## Just write a function in the same file.

::b::

<TheConsole title="article.gjs">

```ts
<template>
  <h1>{{uppercase @title}}</h1>
  <div>{{@body}}</div>
</template>

function uppercase(string: string) {
  return string.toUpperCase();
}
```

</TheConsole>


---
layout: text-code
prose: small
---

# Extracting Into Another Module

::a::


### Named Exports Just Work™️

Just move the function to another file, import it as usual, and it Just Works.

The function signature is just a normal JavaScript signature too. {v-click}

And no need to wrap it in
`helper()` either. {v-click}

::b::

<TheConsole title="utils/uppercase.ts">

```ts
export function uppercase(string: string) {
  return string.toUpperCase();
}
```

</TheConsole>


<TheConsole title="article.gjs">

```ts
import { uppercase } from "./utils/uppercase";

<template>
  <h1>{{uppercase @title}}</h1>
  <div>{{@body}}</div>
</template>
```

</TheConsole>

---
layout: two-cols
kind: octane
clicks: 1
---

# Modifiers

### In Octane, Modifiers Go In Separate Files {.not-prose .octane}

::a::

<the-console v-click="0" title="my-component.hbs">

```hbs
<button {{move-randomly}}>
  {{yield}}
</button>
```

</the-console>

An example from the `ember-modifier` [docs]. {v-click=1}

[docs]: (https://github.com/ember-modifier/ember-modifier#example-with-cleanup)

::b::

<the-console v-click="1" title="app/modifiers/move-randomly.js">

```ts
import { modifier } from 'ember-modifier';
const { random, round } = Math;

export default modifier(element => {
  const id = setInterval(() => {
    const top = round(random() * 500);
    const left = round(random() * 500);
    element.style.transform = 
    `translate(${left}px, ${top}px)`;
  }, 1000);

  return () => clearInterval(id);
});
```

</the-console>

---
layout: text-code
code: small
prose: small
kind: polaris
---

# Inline Modifiers

### Polaris: Just Write a Modifier In the Same File {.not-prose .accent}

::a::

Now you can just write the modifier in the same file and use it directly!

And if you don't need any local state, you can just use a top-level `<template>`.

Pretty sweet! {.fs-up2}

::b::

<the-console title="my-component.gjs">

```ts {all|4,9}
import { modifier } from 'ember-modifier';

<template>
  <button {{moveRandomly}}>{{yield}}</button> // [!code hl]
</template>

const { random, round } = Math;

const moveRandomly = modifier(element => { // [!code hl]
  const id = setInterval(() => {
    const top = round(random() * 500);
    const left = round(random() * 500);
    element.style.transform = 
    `translate(${left}px, ${top}px)`;
  }, 1000);

  return () => clearInterval(id);
});
```

</the-console>


---
layout: two-cols
code: small
kind: polaris
clicks: 1
---

# Extracting Into Another Module

::a::


### It Just Works™️ {.polaris}

Just move the modifier to another file, import it as usual, and it Just Works.

Named exports work, just like functions, but so do default exports. {v-click}

::b::

<TheConsole title="my-component.gjs">

```ts {all|1} {at:0}
import moveRandomly from "./utils/move-randomly"; // [!code hl]

<template>
  <button {{moveRandomly}}>{{yield}}</button>
</template>
```

</TheConsole>

<TheConsole title="utils/move-randomly.ts">

```ts {all|3} {at:0}
import { modifier } from 'ember-modifier';

export default modifier(element => { // [!code hl]
  const id = setInterval(() => {
    const top = round(random() * 500);
    const left = round(random() * 500);
    element.style.transform = 
    `translate(${left}px, ${top}px)`;
  }, 1000);

  return () => clearInterval(id);
});
```

</TheConsole>


---
layout: two-cols
kind: polaris
---

# Multiple Components In One File

::a::

#### Like JSX... But With Template Syntax. {.polaris v-click="1"}
#### Like SFCs... But Multiple In One File. {.polaris v-click="2"}

> You can create multiple components in a single file, like React. {v-click="1"}

> But you can use template syntax, like Vue and Svelte. {v-click="2"}

> It's a unique combination that you can't get anywhere else. {v-click="3" .emphasize}

::b::

<TheConsole title="tabs.gjs">

```ts
<template>
  <Accordion @items={{@items}} as |accordion item|>
    <accordion.toggle>
      <Toggle @name={{item.name}} />
    </accordion.toggle>
    <accordion.panel>
      {{item.description}}
    </accordion.panel>
  </Accordion>
</template>

const Toggle = <template>
  <i class="fas fa-angle-right" />
  {{@name}}
</template>
```

</TheConsole>

---
layout: section
heading: center
---

# Resources

Resources are reactive objects with lifecycle. {.text-center}

> They rationalize [class-based helpers]{.inline-li content="a"}, 
> [modifiers]{.inline-li content="b"}, [services]{.inline-li content="c"}, 
> and even [routing]{.inline-li content="d"} (as we'll see in a bit).
> {.emphasize .header content="🤝"}

---
layout: two-cols
code: small
---

# Template Helpers With Lifecycle

::a::

### Octane: "Class-Based Helpers" {.not-prose .octane}

<the-console title="current-time.ts">

```ts
export default class CurrentTime {
  #timer = setInterval(() => { this.current = new Date() });
  @tracked current = new Date();

  compute() {
    return this.current;
  }

  willDestroy() {
    clearInterval(this.#timer);
  }
}
```

</the-console>

<the-console title="clock.hbs">

```hbs
<p>{{format-date (current-time)}}</p>
```

</the-console>

::b::

### Polaris: Resources {.not-prose .polaris}

<the-console title="clock.gts">

```ts
import formatDate from "./utils/format-date";
import { Resource, Cell } from "@starbeam/universal";

<template>
  <p>{{formatDate (currentTime)}}</p>
</template>

const currentTime = Resource(({ on }) => {
  const current = Cell(new Date());

  on.setup(() => {
    const timer = setInterval(() => current.set(new Date()), 1000);
    return () => clearInterval(timer);
  });

  return current;
});
```

</the-console>

---
layout: two-cols
kind: polaris
code: small
---

# Services

## A Service is a Resource Scoped to an App {.polaris}

::a::

<the-console title="app/services/current-time.ts">

```ts
import { Resource } from "@starbeam/universal";

export default Resource(({ on }) => {
  const current = Cell(new Date());

  on.setup(() => {
    const timer = setInterval(() => current.set(new Date()), 1000);
    return () => clearInterval(timer);
  });

  return current;
});
```

</the-console>

::b::

<the-console title="app/components/clock.gts">

```ts
import { service } from "@starbeam/universal";
import { Component } from "@glimmer/component";

import CurrentTime from "#app/services/current-time";
import formatDate from "#app/utils/format-date";

export default Clock extends Component {
  #currentTime = service(CurrentTime);

  <template>
    <p>{{format-date this.#currentTime}}</p>
  </template>
}
```

</the-console>

> The `currentTime` field is correctly inferred by TypeScript.
> {.emphasize v-click}


---
layout: two-cols
kind: polaris
code: small
---

# Modifiers

## A Modifier is a Resource Scoped to an Element {.polaris}

::a::

<the-console title="app/modifiers/element-size.ts">

```ts
import { Resource } from "@starbeam/universal";

export default function elementSize (
  element: HTMLElement,
  update: (size: BoundingClientRect) => void) => 
    Resource(({ on }) => {
      update(element.getBoundingClientRect());

      on.setup(() => {
        const observer = new ResizeObserver(() => {
          update(element.getBoundingClientRect());
        });

        return () => observer.disconnect();
      });
    });
```

</the-console>

::b::

<the-console title="app/components/clock.gts">

```ts
import { service } from "@ember/service";
import { Component } from "@glimmer/component";

import elementSize from "@/modifiers/element-size";

export default Clock extends Component {
  @tracked accessor #size: DOMRect;

  <template>
    <div {{elementSize this.#updateSize}}>{{yield}}</div>
    <p>The size is {{this.#size.width}}x{{this.#size.height}}</p>
  </template>

  #updateSize(size: DOMRect) {
    this.#size = size;
  }
}
```

</the-console>

---
layout: two-cols
prose: small
---

# What is `@starbeam/universal`




::b::


<the-console title="clock.jsx">

```ts{all|1}
import { useModifier } from "@starbeam/react"; // [!code focus]
import elementSize from "@ui/library";

export default function Clock({ children }) {
  const [size, setSize] = useState(null);
  const element = useRef(null);

  useModifier(elementSize, element, setSize);

  return (
    <>
      <div ref={element}>{children}</div>
      <p>The size is {size.width}x{size.height}</p>
    </>
  )
}
```

</the-console>

::a::

Code written using `@starbeam/universal` APIs will also work in other frameworks with a Starbeam renderer.

<the-console title="app/modifiers/element-size.ts">

```ts{all|1}
import { Resource } from "@starbeam/universal"; // [!code focus]

export default function (element, update) => 
  Resource(({ on }) => {
    update(element.getBoundingClientRect());

    on.setup(() => {
      const observer = new ResizeObserver(() => {
        update(element.getBoundingClientRect());
      });

      return () => observer.disconnect();
    });
  });
```

</the-console>

---
layout: intro
---

### Which brings us to...

# Routing

## A route's model is a Resource scoped to its route. {.polaris}

---
layout: two-cols
---

# An Async Resource

::a::

#### What you'll probably write for simple fetches.

<the-console title="app/routes/articles.ts">

```ts
import { RemoteData } from "#app/utils/remote-data";

export default () => RemoteData("/articles.json");
```

</the-console>


You don't *have* to support cancellation, but it's probably a good idea. {v-click}

::b::

#### How you'd write `RemoteData` by hand.

<the-console title="app/utils/remote-data.ts">

```ts
import { Resource, Cell } from "@starbeam/universal";

export default () => Resource(({ on }) => {
  const data = Cell({ status: "loading" });

  on.setup(() => {
    const controller = new AbortController();

    fetch(url.current, { signal: controller.signal })
      .then((response) => response.json())
      .then((json) => data.set({ status: "ok", data: json }));
      .catch((error) => data.set({ status: "error", error }));

    return () => controller.abort();
  });

  return data;
});
```

</the-console>

---
layout: intro
---

## Dynamic Segments Are Parameters.

~~~md console title="app/routes/articles.data.ts" code=large
```ts
import { RemoteData } from "#app/utils/remote-data";

export default (id: string) => 
  RemoteData(`/articles/${id}.json`);
```
~~~

---
layout: text-code
class: not-prose fs-base
columns: 1fr 2fr
---

# Routing Map

::a::

Routes are the main unit of **code splitting** in Polaris.

> The mapping from `articles/:id` to the function in `articles.data.ts` 
> is fully type-safe. {v-click .emphasize .p-2 .fs-down1 .lh-up1 content="💡"}

::b::

<the-console title="app/routes/index.ts" code="medium-lg">

```ts
import { map, to } from "@ember/routing";

map(import.meta, [
  to("articles"),
  to("article", { path: "articles/:id" }],
]);
```

</the-console>

<the-console title="app/routes/articles.data.ts" code="medium-lg">

```ts
import { RemoteData } from "#app/utils/remote-data";

export default (id: string) => 
  ({ articles: RemoteData(`/articles/${id}.json`) });
```

</the-console>

<style>
p code {
  background-color: var(--color-polaris);
  color: var(--color-polaris-fg);
}
</style>

---
layout: text-code
---

# Routes

::a::

A route's component and its code load in parallel.

> This happens across a tree of routes, avoiding waterfalls.
> {.emphasize .fs-base .lh-up2 .p-3 .not-prose}

<video src="/waterfalls.mp4" autoplay loop v-click></video>



::b::

~~~md console title="app/routes/articles.data.ts" code=medium
```ts
import { RemoteData } from "#app/utils/remote-data";

export default (id: string) => 
  ({ articles: RemoteData(`/articles/${id}.json`) });
```
~~~

~~~md console title="app/routes/articles.gts" code="medium-lg"
```ts
import Article from "#app/components/article";

<template>
  {{#each @articles as |article|}}
    <Article @article={{article}} />
  {{/each}}
</template>
```
~~~

---
layout: two-cols
---

::a::

::b::

~~~md console title="app/routes/index.gts"
```ts
import { map, to } from "@ember/routing";

map(import.meta, [
  to("articles"),
  to("article", { path: "articles/:id" }],
]);
```
~~~


<style>
p code {
  background-color: var(--color-polaris);
  color: var(--color-polaris-fg);
}
</style>

---
layout: section
---

# Routing {.text-center}

Routing has been at the heart of Ember since Ember 1.0. {.text-center}

> At its core, Ember is a <u>web framework</u>, and good URL support is critical to web applications.
> {.emphasize .header content="🌐"}

<style>
  u {
    text-decoration: none;
    color: var(--color-accent-fg);
  }
</style>

---
layout: section
---

# What Does "Good URL Support" Mean?

- The back-button works
- Reloading the page works

> "works" means that the page looks the way the user expected it to look. {.fs-up2 .my-3}
> 
> This means that meaningful state, especially the current page, is preserved. It also means that
> it's possible to create permalinks that include active filters and other "query param" state.
> {.fs-down1 .lh-base}
> {.emphasize .header .p-1}

---
layout: intro
---


---
layout: two-cols
code: large
---

# CSS {.mb-0}


::a::

## Bringing it All Together 

~~~md console title="counter.gjs" code=medium
```ts {all|1}
<template>
  <div>{{yield}}</div>

  <style>
    div {
      border: 1px solid var(--theme-color);
    }
  </style>
</template>
```
~~~

::b::

#### Generated CSS

~~~md console title="counter.css"
```css
div[data-v-7ba5bd90] {
  border: 1px solid var(--theme-color);
}
```
~~~

#### ~ Generated JS

~~~md console title="counter.gjs"
```ts
import "./counter.css";

<template>
  <div data-v-7ba5bd90>{{ yield }}</div>
</template>;
```
~~~