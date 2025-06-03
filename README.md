# Quartz-Slide
- It’s a custom plugin that enables slide in [Quartz 4](https://quartz.jzhao.xyz/).
  - built using [remark](https://github.com/gnab/remark).
- [demo](https://yoma.kr/z-index/Guideline)
- Slides are divided based on `<h>` tags or `<hr>` elements.

## Supported Features
- Runtime Slide
  - Press `cmd / ctrl` + `s`
  - Click the slide icon button
- URL Parameters Options
  |Parameter|Type|Default|Description|
  |:---|:---|:---|:---|
  |slide|boolean|`false`| If `start=true` is set, the slide starts automatically|
  |ratio|string|`16:9`|Enable scroll navigation|
  |scroll|boolean|`false`|Enable touch navigation|
  |touch|boolean|`true`|Enable click-based navigation|
  |click|boolean|`false`|Enable click-based navigation|
  |startOnChange|boolean|`true`|Auto-start timer on slide change|
  |resetable|boolean|`true`|Allow timer reset|
  |enabled|boolean|`true`|Enable slide timer|
  |includePresenterNotes|boolean|`true`|Display presenter notes in the slide view|
  - [https://yoma.kr/?slide=true](https://yoma.kr/?slide=true)
  - [https://yoma.kr/?slide=true&scroll=true](https://yoma.kr/?slide=true&scroll=true)

<br/>


# Installation
- You must complete all of the following steps for it to work.

<br/>

## 1. Add files
- `Slide.tsx` -> `quartz/components`
- `slide.inline.ts` -> `quartz/components/scripts`
- `slide.js` -> `quartz/static/scripts/slide.js`

<br/>

## 2. Edit `quartz/components/index.ts`
```ts
import Slide from './Slide'

export{
  ...,
  Slide
}
```

<br/>

## 3. Edit `quartz.layout.ts`
```ts
export const defaultContentPageLayout: PageLayout = {
// or export const defaultListPageLayout: PageLayout = {
  left: [
    Component.Flex({
      components: [
        ...,
        { Component: Component.Slide() }
      ]
    })
  ]

}
```

### Options
```ts
Component.Slide({
  ratio: "16:9" | "4:3",          // default 16:9
  navigation: {
    scroll: boolean,              // default false
    touch: boolean,               // default true
    click: boolean,               // default false
  },
  timer: {
    startOnChange: boolean,       // default true
    resetable: boolean,           // default true
    enabled: boolean,             // default true
  },
  includePresenterNotes: boolean, // default true
}),
```

<br/>

# Done!
- Enjoy the Slide!
