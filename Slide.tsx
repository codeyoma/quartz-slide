import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/slide.inline"
import style from "./styles/slide.scss"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

export interface SlideOptions {
  ratio: "16:9" | "4:3",
  navigation: {
    scroll: boolean,
    touch: boolean,
    click: boolean,
  },
  timer: {
    startOnChange: boolean,
    resetable: boolean,
    enabled: boolean,
  },
  includePresenterNotes: boolean,
  tags: boolean,
  index: boolean,
  align: "left" | "center"
}

const defaultOptions: SlideOptions = {
  ratio: "16:9",
  navigation: {
    scroll: false,
    touch: true,
    click: false,
  },
  timer: {
    startOnChange: true,
    resetable: true,
    enabled: true,
  },
  includePresenterNotes: true,
  tags: true,
  index: true,
  align: "left"
}

export default ((opts?: Partial<SlideOptions>) => {
  const Slide: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {

    const option: SlideOptions = { ...defaultOptions, ...opts }

    const button = (
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 -960 960 960"
        fill="currentColor"
        xmlSpace="preserve"
      >
        <path d="m380-300 280-180-280-180v360ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
      </svg>
    )

    return (
      <div class={classNames(displayClass, "slide-button")}
        data-cfg={JSON.stringify(option)}
      >
        <button class="slide-icon" aria-label="Slide Toggle">
          {button}
        </button>
      </div>
    )
  }

  Slide.css = style
  Slide.afterDOMLoaded = script

  return Slide
}) satisfies QuartzComponentConstructor
