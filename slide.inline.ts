import { SlideOptions } from '../Slide'

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


function unwrapSlideNote(html: string): string {
  return html.replace(/<p>(\?{3}[\s\S]*?)<\/p>/g, (_, content) => content)
}

function unwrapFootnotesSection(html: string): string {
  return html.replace(
    /<section[^>]*data-footnotes[^>]*class="footnotes"[^>]*>([\s\S]*?)<\/section>/gi,
    (_, inner) => inner
  )
}

function collapseSeparators(input: string): string {
  return input.replace(/(?:\n*\s*---\s*\n*){2,}/g, '\n---\n')
}

function injectSeparators(html: string, separator = "\n---\n"): string {
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

function appendRemark(option: SlideOptions) {

  const header = `${document.querySelector(".page-header h1.article-title")?.outerHTML}`
  const tags = document.querySelector(".page-header .tags")?.outerHTML ?? ""

  if (!header) {
    console.warn("No header found in the document. Cannot render slide.")
    return;
  }

  const body = document.querySelector(".center article")?.innerHTML
  const data = unwrapSlideNote(unwrapFootnotesSection(collapseSeparators(injectSeparators(header + tags + body))))
  document.body.innerHTML = ""

  const style = document.createElement("style")
  style.textContent = `
  .remark-slide-content {
    overflow: auto !important;
    max-height: 100vh;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      position: sticky;
      top: 0;
      z-index: 1;
      background-color: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(8px);
    }

    h1 {
      color: var(--primary);
    }

    .tags {
      gap: .6rem;
    }

    li {
      line-height: 2;
      list-style-type: disc;
    }

    p {
      margin: 0;
    }

    .remark-slide-number{
    }

    pre {
      padding: 0;
    }
  }

  `

  document.head.appendChild(style)

  const script = document.createElement("script")
  // script.src = `${window.location.origin}/static/scripts/remark.js`
  script.src = `https://codeyoma.github.io/static/scripts/remark.js`

  script.onload = () => {
    remark.create({
      ...option,
      source: data,
    },
      renderMermaidInSlide()
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
