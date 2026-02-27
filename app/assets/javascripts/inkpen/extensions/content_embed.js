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

    const children = [
      ["span", { class: "inkpen-content-embed__title" }, title || "Untitled"]
    ]
    if (subtitle) {
      children.push(["span", { class: "inkpen-content-embed__subtitle" }, subtitle])
    }
    const label = type ? `View ${type} →` : "View →"
    children.push(["a", { href: url, class: "inkpen-content-embed__action", target: "_blank", rel: "noopener noreferrer" }, label])

    return [
      "div",
      {
        "data-content-embed": "",
        "data-embed-type": type,
        "data-embed-id": embedId,
        "data-embed-title": title,
        "data-embed-url": url,
        "data-embed-subtitle": subtitle || "",
        class: "inkpen-content-embed"
      },
      ...children
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const { type, title, url, subtitle } = node.attrs

      const dom = document.createElement("div")
      dom.className = "inkpen-content-embed"
      dom.setAttribute("data-content-embed", "")
      dom.setAttribute("data-embed-type", type || "")
      dom.contentEditable = "false"

      const titleEl = document.createElement("span")
      titleEl.className = "inkpen-content-embed__title"
      titleEl.textContent = title || "Untitled"
      dom.appendChild(titleEl)

      if (subtitle) {
        const sub = document.createElement("span")
        sub.className = "inkpen-content-embed__subtitle"
        sub.textContent = subtitle
        dom.appendChild(sub)
      }

      const action = document.createElement("a")
      action.className = "inkpen-content-embed__action"
      action.href = url || "#"
      action.target = "_blank"
      action.rel = "noopener noreferrer"
      const label = type ? `View ${type} \u2192` : "View \u2192"
      action.textContent = label
      dom.appendChild(action)

      return { dom }
    }
  }
})

export default ContentEmbed
