import { mouseEnterHandler, clearActivePopover } from './popover.inline'
import { SlideOptions } from '../Slide'

function addClipboard() {
  const svgCopy =
    '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true"><path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path></svg>'
  const svgCheck =
    '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true"><path fill-rule="evenodd" fill="rgb(63, 185, 80)" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg>'

  const els = document.getElementsByTagName("pre")
  for (let i = 0; i < els.length; i++) {
    const button = els[i].querySelector(".clipboard-button") as HTMLButtonElement | null
    const codeBlock = els[i].getElementsByTagName("code")[0]

    if (!button || !codeBlock) continue

    const source = (
      codeBlock.dataset.clipboard ? JSON.parse(codeBlock.dataset.clipboard) : codeBlock.innerText
    ).replace(/\n\n/g, "\n")

    function onClick() {
      navigator.clipboard.writeText(source).then(
        () => {
          if (button) {
            button.blur()
            button.innerHTML = svgCheck
            setTimeout(() => {
              button.innerHTML = svgCopy;
              button.style.borderColor = ""
            }, 2000)
          }
        },
        (error) => console.error(error),
      )
    }

    button.addEventListener("click", onClick)
    window.addCleanup(() => button.removeEventListener("click", onClick))
  }
}

function renderPopoverInSlide() {
  const mindmapLinks = document.querySelectorAll(".remark-slide-content a.internal") as NodeListOf<HTMLAnchorElement>
  for (const link of mindmapLinks) {
    if (link.dataset.noPopover === "true") continue

    link.addEventListener("mouseenter", mouseEnterHandler)
    link.addEventListener("mouseleave", clearActivePopover)
    window.addCleanup?.(() => {
      link.removeEventListener("mouseenter", mouseEnterHandler)
      link.removeEventListener("mouseleave", clearActivePopover)
    })
  }
}

function decodeHTMLEntities(html: string): string {
  const txt = document.createElement("textarea")
  txt.innerHTML = html
  return txt.value
}

function renderMermaidInSlide() {
  requestAnimationFrame(async () => {
    const codeBlocks = document.querySelectorAll(".remark-slide-content code.mermaid")
    if (codeBlocks.length === 0) return

    const { default: mermaid } = await import(
      "https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.0/mermaid.esm.min.mjs"
    )

    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.getAttribute("saved-theme") === "dark" ? "dark" : "base",
      securityLevel: "loose",
    })
    for (const code of codeBlocks) {
      const raw = code.getAttribute("data-clipboard")
      const pre = code.closest("pre")
      const container = pre?.querySelector(".mermaid-content")
      if (!raw || !pre || !container) continue

      const decoded = decodeHTMLEntities(raw)

      let diagram = ""
      try {
        diagram = JSON.parse(decoded)
      } catch (e) {
        console.error("❌ JSON.parse failed for mermaid code:", decoded)
        continue
      }

      const tempDiv = document.createElement("div")
      tempDiv.style.visibility = "hidden"
      tempDiv.style.position = "absolute"
      tempDiv.style.top = "-9999px"

      const mermaidDiv = document.createElement("div")
      mermaidDiv.className = "mermaid"
      mermaidDiv.textContent = diagram

      tempDiv.appendChild(mermaidDiv)
      document.body.appendChild(tempDiv)

      try {
        await mermaid.run({ nodes: [mermaidDiv] })
        const svg = mermaidDiv.querySelector("svg")
        if (svg) {
          pre.replaceWith(svg.cloneNode(true))
          // container.replaceWith(svg.cloneNode(true))
        }
      } catch (err) {
        console.error("❌ Mermaid render failed:", err)
      } finally {
        tempDiv.remove()
      }
    }
  })
}


function anchorBlank(html: string): string {
  // return html.replace(/<a\b([^>]*?)>/g, '<a $1 target="_blank">')
  // return html.replace(/(?<!<sup>)<a\b([^>]*?)>/g, '<a $1 target="_blank">')
  return html
}

function unwrapSlideNote(html: string): string {
  return html.replace(/<p>(\?{3}[\s\S]*?)<\/p>/g, (_, content) => content)
}

function unwrapFootnotesSection(html: string): string {
  return html.replace(
    /<section[^>]*data-footnotes[^>]*class="footnotes"[^>]*>([\s\S]*?)<\/section>/gi,
    (_, inner) => inner
  )
}

function injectSeparators(html: string, separator: string): string {
  let firstHeadingInjected = false

  return html
    .replace(/<hr\s*\/?>/gi, separator)
    .replace(/(<h[1-6]\b[^>]*>)/gi, (match) => {
      if (!firstHeadingInjected) {
        firstHeadingInjected = true
        return match
      } else {
        return separator + match
      }
    })
}

function handleFootnote(data: string, separator: string) {
  const slides = data.split(separator)
  const refIndexMap = new Map<string, number>()

  slides.forEach((slide, index) => {
    const regex = /<sup><a [^>]*?id="(user-content-fnref[^"]+)"/g

    let match
    while ((match = regex.exec(slide)) !== null) {
      const id = match[1]
      refIndexMap.set(`#${id}`, index + 1)
    }

    const hrefRegex = /<sup><a href="(#user-content-fn[^"]+)"/g
    slide = slide.replace(hrefRegex, () => {
      return `<sup><a href="#${slides.length}"`
    })

    slides[index] = slide
  })

  slides[slides.length - 1] = slides[slides.length - 1].replace(
    /<a\s+([^>]*?)href="(#user-content-fn[^"]+)"([^>]*)>/g,
    (fullMatch, beforeHref, href, afterHref) => {
      if (refIndexMap.has(href)) {
        return `<a ${beforeHref}href="#${refIndexMap.get(href)}"${afterHref}>`
      }
      return fullMatch
    }
  )

  return slides.join("\n---\n")
}

function handleIndex(data: string, separator: string, option: SlideOptions, index: string) {
  const slides = data.split(separator)

  if (!option.index) return slides.join(separator);
  slides.splice(1, 0, index)

  const indexMap = new Map<string, number>()
  const regex = /<h1[^>]*id="[^"]*"[^>]*>(.*?)<\/h1>/g;
  const tempDiv = document.createElement('div');

  slides.forEach((slide, index) => {
    let match
    while ((match = regex.exec(slide)) !== null) {
      const fullH1Html = match[0];
      tempDiv.innerHTML = fullH1Html;
      const h1Element = tempDiv.querySelector('h1');

      if (h1Element && h1Element.firstChild) {
        const content = h1Element.firstChild.textContent?.trim();

        if (content) {
          indexMap.set(content, index + 1);
        }
      }
    }
  })

  if (slides.length > 2) {
    slides[1] = slides[1].replace(
      /<a\s+([^>]*?)data-href="([^"]*)" ([^>]*)>/g,
      (fullMatch, beforeHref, dataHref, afterHref) => {
        if (indexMap.has(dataHref)) {
          return `<a ${beforeHref}href="#${indexMap.get(dataHref)}"${afterHref}>`
        }
        return fullMatch
      }
    )
  }

  return slides.join(separator)
}

function makeIndex() {

  const headers = document.querySelectorAll('article.popover-hint h1[id]');
  const index = Array.from(headers).map(head => `<li><a data-href="${head.textContent}" class="">${head.textContent}</a></li>`).join('')

  return `
    <h1 class="slide-index-title">Index</h1>
    <ul class="slide-index-list" >
      ${index}
    </ul>
  `
}

function appendRemark(option: SlideOptions) {

  const header = `${document.querySelector(".page-header h1.article-title")?.outerHTML}`
  const tags = document.querySelector(".page-header .tags")?.outerHTML ?? ""

  if (!header) {
    console.warn("No header found in the document. Cannot render slide.")
    return;
  }
  const separator = "\n---\n<div id=\"inject-slide\"></div>";

  const body = document.querySelector(".center article")?.innerHTML

  // sorry callback hell
  const data =
    anchorBlank(
      unwrapSlideNote(
        unwrapFootnotesSection(
          handleFootnote(
            handleIndex(
              injectSeparators(header + (option.tags ? tags : "") + body, separator),
              separator,
              option,
              makeIndex()
            ),
            separator
          ),
        )
      )
    )

  document.body.innerHTML = ""

  const script = document.createElement("script")
  script.src = `${window.location.origin}/static/scripts/slide.js`
  // script.src = `https://codeyoma.github.io/static/scripts/remark.js`

  script.onload = () => {
    remark.create({
      ...option,
      source: data,
    },
      () => {
        renderMermaidInSlide()
        renderPopoverInSlide()
        addClipboard()
      }
    )
  }
  document.body.appendChild(script)
}

function paramOption(defaultOption: SlideOptions) {
  const params = new URLSearchParams(window.location.search)

  const getBool = (key: string, fallback = false) =>
    params.has(key) ? params.get(key)?.toLowerCase() === "true" : fallback

  const ratioParam = params.get("ratio")
  const ratio = ratioParam === "4:3" ? "4:3" : "16:9"

  return ({
    ...defaultOption,
    ratio,
    navigation: {
      ...defaultOption.navigation,
      scroll: getBool("scroll", defaultOption.navigation.scroll),
      touch: getBool("touch", defaultOption.navigation.touch),
      click: getBool("click", defaultOption.navigation.click),
    },
    timer: {
      ...defaultOption.timer,
      startOnChange: getBool("startOnChange", defaultOption.timer.startOnChange),
      resetable: getBool("resetable", defaultOption.timer.resetable),
      enabled: getBool("enabled", defaultOption.timer.enabled),
    },
    includePresenterNotes: getBool("includePresenterNotes", defaultOption.includePresenterNotes),
    tags: getBool("tags", defaultOption.tags),
    index: getBool("index", defaultOption.index),
  } as SlideOptions)
}

document.addEventListener("nav", async () => {
  async function renderSlide() {
    const slideContainers = document.getElementsByClassName("slide-button")
    const option = (slideContainers[0] as HTMLElement).dataset["cfg"]

    if (!option) {
      console.warn("No slide configuration found in the clicked element.")
      return
    }

    const mergedOption = paramOption(JSON.parse(option))
    appendRemark(mergedOption)
  }

  function hideSlide() {
    window.location.reload()
  }

  async function shortcutHandler(e: HTMLElementEventMap["keydown"]) {
    if (e.key === "s" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault()
      const anySlideOpen = document.querySelector(".remark-container")
      anySlideOpen ? hideSlide() : renderSlide()
    }
  }

  const containerIcons = document.getElementsByClassName("slide-icon")
  Array.from(containerIcons).forEach((icon) => {
    icon.addEventListener("click", renderSlide)
    window.addCleanup(() => icon.removeEventListener("click", renderSlide))
  })

  document.addEventListener("keydown", shortcutHandler)
  window.addCleanup(() => {
    document.removeEventListener("keydown", shortcutHandler)
  })

  const params = new URLSearchParams(window.location.search)
  if (params.get("slide") === "true") {
    await renderSlide()
  }
})
