import { Node, mergeAttributes } from "@tiptap/core"

/**
 * Content Embed Extension for TipTap
 *
 * Renders rich, clickable embed cards for internal content
 * (stories, ships, series, or any app-defined content type).
 *
 * The node is atomic (non-editable) and stores content metadata
 * as attributes. Apps can style the card via `.inkpen-content-embed`.
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
      subtitle: { default: null },
      icon: { default: null }
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
        subtitle: dom.getAttribute("data-embed-subtitle"),
        icon: dom.getAttribute("data-embed-icon")
      })
    }]
  },

  renderHTML({ node }) {
    const { type, embedId, title, url, subtitle, icon } = node.attrs

    const typeLabels = { story: "Story", ship: "Ship", series: "Series" }
    const typeIcons = { story: "\uD83D\uDCD6", ship: "\uD83D\uDE80", series: "\uD83D\uDCDA" }
    const typeLabel = typeLabels[type] || type || "Embed"
    const typeIcon = icon || typeIcons[type] || "\uD83D\uDD17"

    return [
      "div",
      {
        "data-content-embed": "",
        "data-embed-type": type,
        "data-embed-id": embedId,
        "data-embed-title": title,
        "data-embed-url": url,
        "data-embed-subtitle": subtitle || "",
        "data-embed-icon": typeIcon,
        class: "inkpen-content-embed"
      },
      [
        "a",
        { href: url, target: "_blank", rel: "noopener noreferrer", class: "inkpen-content-embed__link" },
        [
          "span",
          { class: "inkpen-content-embed__badge" },
          `${typeIcon} ${typeLabel}`
        ],
        ["span", { class: "inkpen-content-embed__title" }, title || "Untitled"],
        ...(subtitle ? [["span", { class: "inkpen-content-embed__subtitle" }, subtitle]] : [])
      ]
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const { type, embedId, title, url, subtitle, icon } = node.attrs

      const typeLabels = { story: "Story", ship: "Ship", series: "Series" }
      const typeIcons = { story: "\uD83D\uDCD6", ship: "\uD83D\uDE80", series: "\uD83D\uDCDA" }
      const typeLabel = typeLabels[type] || type || "Embed"
      const typeIcon = icon || typeIcons[type] || "\uD83D\uDD17"

      const dom = document.createElement("div")
      dom.className = "inkpen-content-embed"
      dom.setAttribute("data-content-embed", "")
      dom.setAttribute("data-embed-type", type || "")
      dom.contentEditable = "false"

      const link = document.createElement("a")
      link.href = url || "#"
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      link.className = "inkpen-content-embed__link"

      const badge = document.createElement("span")
      badge.className = "inkpen-content-embed__badge"
      badge.textContent = `${typeIcon} ${typeLabel}`

      const titleEl = document.createElement("span")
      titleEl.className = "inkpen-content-embed__title"
      titleEl.textContent = title || "Untitled"

      link.appendChild(badge)
      link.appendChild(titleEl)

      if (subtitle) {
        const sub = document.createElement("span")
        sub.className = "inkpen-content-embed__subtitle"
        sub.textContent = subtitle
        link.appendChild(sub)
      }

      dom.appendChild(link)

      return { dom }
    }
  }
})

export default ContentEmbed
