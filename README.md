# Quartz-Slide
- It’s a custom plugin that enables slide in [Quartz 4](https://quartz.jzhao.xyz/).
  - built using [remark](https://github.com/gnab/remark).
- [demo slide](https://yoma.kr/z-index/Guideline?slide=true)
  - [origin content](https://yoma.kr/z-index/Guideline)
- Slides are divided based on `<h>` tags or `<hr>` elements.

<br/>

## Supported Features
- Runtime Slide
  - Toggle slide - Press `cmd / ctrl` + `s`
  - Start slide - Click the slide icon button
- URL Parameters Options
  |Parameter|Type|Default|Description|
  |:---|:---|:---|:---|
  |slide|boolean|`false`| If `start=true` is set, the slide starts automatically|
  |ratio|string|`16:9`|Slide aspect ratio `16:9` or `4:3`|
  |scroll|boolean|`false`|Enable mouse scroll navigation|
  |touch|boolean|`true`|Enable touch navigation|
  |click|boolean|`false`|Enable click-based navigation|
  |startOnChange|boolean|`true`|Auto-start timer on slide change|
  |resetable|boolean|`true`|Allow timer reset|
  |enabled|boolean|`true`|Enable slide timer|
  |includePresenterNotes|boolean|`true`|Display presenter notes in the slide view|
  - [https://yoma.kr/?slide=true](https://yoma.kr/?slide=true)
  - [https://yoma.kr/?slide=true&scroll=true](https://yoma.kr/?slide=true&scroll=true)
- [Keyboard shortcuts](https://github.com/gnab/remark/wiki/Keyboard-shortcuts)
  - All of these shortcuts can also be seen during a presentation by pressing `H` or `?`
  - `h` or `?` : Toggle the help window
  - `j` : Jump to next slide
  - `k` : Jump to previous slide
  - `b` : Toggle blackout mode
  - `m` : Toggle mirrored mode.
  - `c` : Create a clone presentation on a new window
  - `p` : Toggle PresenterMode
  - `f` : Toggle Fullscreen
  - `t` : Reset presentation timer
  - `<number> + <Return>` : Jump to slide `<number>`
- Presenter Notes
  - To add presenter notes to a slide, insert a line with three question marks (`???`) between the slide content and the notes.
    -	Everything before `???` will appear on the slide.
    - Everything after `???` will be shown only as presenter notes.
  -
    ```
    # Header
    Slide content
    ???
    Presenter Notes
    ```

<br/>

# Installation
- You must complete all of the following steps for it to work.

<br/>

## 1. Add files
- `Slide.tsx` -> `quartz/components/Slide.tsx`
- `slide.inline.ts` -> `quartz/components/scripts/slide.inline.ts`
- `slide.js` -> `quartz/static/scripts/slide.js`
- `slide.scss` -> `quartz/components/styles/slide.scss`
- `slide-custom.scss` -> `quartz/styles/custom.scss`
  - Instead of replacing or moving the file, the contents must be pasted into `custom.scss`

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

## 3. Edit `quartz/components/scripts/popover.inline.ts`
- Add this at the end of the file
```ts
export { mouseEnterHandler, clearActivePopover }
```

<br/>

## 4. Edit `quartz.layout.ts`

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
