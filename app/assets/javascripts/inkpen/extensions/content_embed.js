import { Node, mergeAttributes } from "@tiptap/core"

/**
 * Content Embed Extension for TipTap
 *
 * Renders a non-editable embed card for app content. The node stores
 * metadata as attributes. Visual styling is left to the host app —
 * inkpen only provides the DOM structure and data attributes.
 *
 * @since 0.7.1
 */
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
