import { Node, mergeAttributes } from "@tiptap/core"

/**
 * Content Embed Extension for TipTap
 *
 * Renders a non-editable embed card for app content. The node stores
 * metadata as attributes. Visual styling is left to the host app —
 * inkpen only provides the DOM structure and data attributes.
 *
 * Icons are inline Lucide SVGs so cards render identically to the host
 * app's FAB quick-action buttons.
 *
 * @since 0.7.1
 */

const ICONS = {
  ship: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
  series: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
  roundup: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></svg>',
  showcase: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>',
  story: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>'
}

function getIcon(type) {
  return ICONS[type] || ICONS.ship
}

export const ContentEmbed = Node.create({
  name: "contentEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      type: { default: null },
      embedId: { default: null },
      title: { default: "" },
      url: { default: "#" },
      subtitle: { default: null }
    }
  },

  parseHTML() {
    return [{
      tag: "div[data-content-embed]",
      getAttrs: (dom) => ({
        type: dom.getAttribute("data-embed-type"),
        embedId: dom.getAttribute("data-embed-id"),
        title: dom.getAttribute("data-embed-title"),
        url: dom.getAttribute("data-embed-url"),
        subtitle: dom.getAttribute("data-embed-subtitle")
      })
    }]
  },

  renderHTML({ node }) {
    const { type, embedId, title, url, subtitle } = node.attrs
    const typeName = (type || "embed").toUpperCase()

    const textChildren = [
      ["span", { class: "inkpen-content-embed__title" }, title || "Untitled"]
    ]
    if (subtitle) {
      textChildren.push(["span", { class: "inkpen-content-embed__subtitle" }, subtitle])
    }

    return [
      "div",
      {
        "data-content-embed": "",
        "data-embed-type": type,
        "data-embed-id": embedId,
        "data-embed-title": title,
        "data-embed-url": url || "#",
        "data-embed-subtitle": subtitle || "",
        class: "inkpen-content-embed"
      },
      ["a", { href: url || "#", class: "inkpen-content-embed__link", target: "_blank", rel: "noopener noreferrer" },
        ["span", { class: "inkpen-content-embed__badge" }, typeName],
        ["span", { class: "inkpen-content-embed__body" },
          ["span", { class: "inkpen-content-embed__icon" }, ""],
          ["span", { class: "inkpen-content-embed__text" },
            ...textChildren
          ]
        ]
      ]
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const { type, title, url, subtitle } = node.attrs
      const typeName = (type || "embed").toUpperCase()

      const dom = document.createElement("div")
      dom.className = "inkpen-content-embed"
      dom.setAttribute("data-content-embed", "")
      dom.setAttribute("data-embed-type", type || "")
      dom.contentEditable = "false"

      const link = document.createElement("a")
      link.className = "inkpen-content-embed__link"
      link.href = url || "#"
      link.target = "_blank"
      link.rel = "noopener noreferrer"

      const badge = document.createElement("span")
      badge.className = "inkpen-content-embed__badge"
      badge.textContent = typeName

      const body = document.createElement("span")
      body.className = "inkpen-content-embed__body"

      const iconEl = document.createElement("span")
      iconEl.className = "inkpen-content-embed__icon"
      iconEl.innerHTML = getIcon(type)

      const text = document.createElement("span")
      text.className = "inkpen-content-embed__text"

      const titleEl = document.createElement("span")
      titleEl.className = "inkpen-content-embed__title"
      titleEl.textContent = title || "Untitled"
      text.appendChild(titleEl)

      if (subtitle) {
        const sub = document.createElement("span")
        sub.className = "inkpen-content-embed__subtitle"
        sub.textContent = subtitle
        text.appendChild(sub)
      }

      body.appendChild(iconEl)
      body.appendChild(text)
      link.appendChild(badge)
      link.appendChild(body)
      dom.appendChild(link)

      return { dom }
    }
  }
})

export default ContentEmbed
