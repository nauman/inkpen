import { Node, mergeAttributes } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

/**
 * Social Embed Extension for TipTap
 *
 * Embed content from various platforms:
 * - Twitter/X posts
 * - Instagram posts
 * - TikTok videos
 * - Figma designs
 * - Loom videos
 * - CodePen pens
 * - GitHub Gists
 * - Spotify tracks/playlists
 * - Generic link cards for unsupported URLs
 *
 * Privacy-aware: Shows preview until user clicks to load external content.
 *
 * @since 0.5.0
 */

const EMBED_KEY = new PluginKey("embed")

// Provider configurations
const PROVIDERS = {
  youtube: {
    name: "YouTube",
    icon: "▶",
    color: "#ff0000",
    patterns: [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
    ],
    getEmbedUrl: (id) => `https://www.youtube.com/embed/${id}`,
    aspectRatio: "16/9"
  },

  twitter: {
    name: "Twitter",
    icon: "𝕏",
    color: "#000000",
    patterns: [
      /(?:https?:\/\/)?(?:www\.)?(twitter|x)\.com\/(\w+)\/status\/(\d+)/
    ],
    getEmbedUrl: (match) => null, // Uses widget script
    extractId: (match) => ({ user: match[2], id: match[3] }),
    useWidget: true,
    widgetScript: "https://platform.twitter.com/widgets.js"
  },

  instagram: {
    name: "Instagram",
    icon: "📷",
    color: "#e4405f",
    patterns: [
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/
    ],
    getEmbedUrl: (id) => null,
    extractId: (match) => ({ type: match[1], id: match[2] }),
    useWidget: true,
    widgetScript: "https://www.instagram.com/embed.js"
  },

  tiktok: {
    name: "TikTok",
    icon: "♪",
    color: "#000000",
    patterns: [
      /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([^\/]+)\/video\/(\d+)/,
      /(?:https?:\/\/)?(?:vm\.)?tiktok\.com\/([A-Za-z0-9]+)/
    ],
    getEmbedUrl: (id) => `https://www.tiktok.com/embed/v2/${id}`,
    aspectRatio: "9/16",
    maxWidth: 325
  },

  figma: {
    name: "Figma",
    icon: "◈",
    color: "#f24e1e",
    patterns: [
      /(?:https?:\/\/)?(?:www\.)?figma\.com\/(file|proto|design)\/([A-Za-z0-9]+)/
    ],
    getEmbedUrl: (url) => `https://www.figma.com/embed?embed_host=inkpen&url=${encodeURIComponent(url)}`,
    useFullUrl: true,
    aspectRatio: "16/9"
  },

  loom: {
    name: "Loom",
    icon: "🎥",
    color: "#625df5",
    patterns: [
      /(?:https?:\/\/)?(?:www\.)?loom\.com\/share\/([a-zA-Z0-9]+)/,
      /(?:https?:\/\/)?(?:www\.)?loom\.com\/embed\/([a-zA-Z0-9]+)/
    ],
    getEmbedUrl: (id) => `https://www.loom.com/embed/${id}`,
    aspectRatio: "16/9"
  },

  codepen: {
    name: "CodePen",
    icon: "⌨",
    color: "#000000",
    patterns: [
      /(?:https?:\/\/)?(?:www\.)?codepen\.io\/([^\/]+)\/pen\/([A-Za-z0-9]+)/,
      /(?:https?:\/\/)?(?:www\.)?codepen\.io\/([^\/]+)\/full\/([A-Za-z0-9]+)/
    ],
    getEmbedUrl: (match) => `https://codepen.io/${match[1]}/embed/${match[2]}?default-tab=result`,
    extractId: (match) => ({ user: match[1], pen: match[2] }),
    aspectRatio: "16/9"
  },

  gist: {
    name: "GitHub Gist",
    icon: "📋",
    color: "#24292e",
    patterns: [
      /(?:https?:\/\/)?gist\.github\.com\/([^\/]+)\/([a-f0-9]+)/
    ],
    getEmbedUrl: (match) => null,
    extractId: (match) => ({ user: match[1], id: match[2] }),
    useScript: true,
    getScriptUrl: (match) => `https://gist.github.com/${match[1]}/${match[2]}.js`
  },

  spotify: {
    name: "Spotify",
    icon: "🎵",
    color: "#1db954",
    patterns: [
      /(?:https?:\/\/)?open\.spotify\.com\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)/
    ],
    getEmbedUrl: (match) => `https://open.spotify.com/embed/${match[1]}/${match[2]}`,
    extractId: (match) => ({ type: match[1], id: match[2] }),
    height: 352
  },

  vimeo: {
    name: "Vimeo",
    icon: "▶",
    color: "#1ab7ea",
    patterns: [
      /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/,
      /(?:https?:\/\/)?player\.vimeo\.com\/video\/(\d+)/
    ],
    getEmbedUrl: (id) => `https://player.vimeo.com/video/${id}`,
    aspectRatio: "16/9"
  }
}

// Detect provider from URL
function detectProvider(url) {
  for (const [key, provider] of Object.entries(PROVIDERS)) {
    for (const pattern of provider.patterns) {
      const match = url.match(pattern)
      if (match) {
        return { provider: key, config: provider, match }
      }
    }
  }
  return null
}

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace("www.", "")
  } catch {
    return url
  }
}

export const Embed = Node.create({
  name: "embed",

  group: "block",

  atom: true,

  draggable: true,

  addOptions() {
    return {
      // Provider settings
      providers: PROVIDERS,
      allowedProviders: null, // null = all, or ["youtube", "twitter"]
      // Privacy mode: show placeholder until clicked
      privacyMode: true,
      // Link card settings for unknown URLs
      enableLinkCards: true,
      linkCardFetcher: null, // Custom function to fetch Open Graph data
      // Callbacks
      onEmbed: null,
      onLoad: null,
      onError: null
    }
  },

  addAttributes() {
    return {
      url: {
        default: null
      },
      provider: {
        default: null
      },
      embedData: {
        default: null // Provider-specific data (id, user, etc.)
      },
      loaded: {
        default: false // Has the embed been loaded (for privacy mode)
      },
      // Link card data (for generic URLs)
      linkCard: {
        default: null // { title, description, image, domain }
      },
      error: {
        default: null
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="embed"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "embed",
        "data-provider": node.attrs.provider,
        class: "inkpen-embed"
      }),
      // Content rendered by NodeView
      0
    ]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const extension = this

      // Create container
      const container = document.createElement("div")
      container.className = "inkpen-embed"
      container.setAttribute("data-type", "embed")
      container.setAttribute("data-provider", node.attrs.provider || "link")

      const renderEmbed = () => {
        container.innerHTML = ""

        const provider = node.attrs.provider
        const providerConfig = PROVIDERS[provider]
        const isLoaded = node.attrs.loaded || !extension.options.privacyMode
        const hasError = node.attrs.error

        if (hasError) {
          // Error state
          container.innerHTML = `
            <div class="inkpen-embed__error">
              <span class="inkpen-embed__error-icon">⚠️</span>
              <span class="inkpen-embed__error-text">${node.attrs.error}</span>
              <button type="button" class="inkpen-embed__remove" title="Remove">×</button>
            </div>
          `
          container.querySelector(".inkpen-embed__remove")?.addEventListener("click", () => {
            if (typeof getPos === "function") {
              editor.chain().focus().deleteRange({
                from: getPos(),
                to: getPos() + node.nodeSize
              }).run()
            }
          })
          return
        }

        if (!provider || !providerConfig) {
          // Link card for unknown URLs
          renderLinkCard(container, node, editor, getPos)
          return
        }

        if (!isLoaded) {
          // Privacy placeholder
          container.innerHTML = `
            <div class="inkpen-embed__placeholder" style="--provider-color: ${providerConfig.color}">
              <div class="inkpen-embed__placeholder-icon">${providerConfig.icon}</div>
              <div class="inkpen-embed__placeholder-info">
                <span class="inkpen-embed__placeholder-name">${providerConfig.name}</span>
                <span class="inkpen-embed__placeholder-url">${extractDomain(node.attrs.url)}</span>
              </div>
              <button type="button" class="inkpen-embed__load-btn">Load ${providerConfig.name}</button>
            </div>
          `
          container.querySelector(".inkpen-embed__load-btn")?.addEventListener("click", () => {
            if (typeof getPos === "function") {
              editor.chain().focus().updateAttributes("embed", { loaded: true }).run()
            }
          })
          return
        }

        // Loaded embed
        if (providerConfig.useWidget) {
          renderWidget(container, node, providerConfig)
        } else if (providerConfig.useScript) {
          renderScript(container, node, providerConfig)
        } else {
          renderIframe(container, node, providerConfig)
        }
      }

      renderEmbed()

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "embed") return false
          node = updatedNode
          container.setAttribute("data-provider", node.attrs.provider || "link")
          renderEmbed()
          return true
        },
        selectNode: () => {
          container.classList.add("is-selected")
        },
        deselectNode: () => {
          container.classList.remove("is-selected")
        }
      }
    }
  },

  addCommands() {
    return {
      insertEmbed: (url) => ({ commands, editor }) => {
        const detected = detectProvider(url)

        if (detected) {
          const { provider, config, match } = detected
          const embedData = config.extractId ? config.extractId(match) : match[1]

          return commands.insertContent({
            type: this.name,
            attrs: {
              url,
              provider,
              embedData,
              loaded: !this.options.privacyMode
            }
          })
        }

        // Unknown URL - create link card
        if (this.options.enableLinkCards) {
          commands.insertContent({
            type: this.name,
            attrs: {
              url,
              provider: null,
              linkCard: {
                title: extractDomain(url),
                description: null,
                image: null,
                domain: extractDomain(url)
              },
              loaded: true
            }
          })

          // Fetch Open Graph data if fetcher provided
          if (this.options.linkCardFetcher) {
            this.options.linkCardFetcher(url).then(data => {
              // Update the node with fetched data
              // This would need to find the node by URL
            }).catch(() => {
              // Keep basic link card
            })
          }

          return true
        }

        return false
      },

      loadEmbed: () => ({ commands }) => {
        return commands.updateAttributes(this.name, { loaded: true })
      },

      setEmbedError: (error) => ({ commands }) => {
        return commands.updateAttributes(this.name, { error })
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { selection } = editor.state
        const node = selection.node

        if (node?.type.name === this.name) {
          return editor.commands.deleteSelection()
        }
        return false
      },
      Delete: ({ editor }) => {
        const { selection } = editor.state
        const node = selection.node

        if (node?.type.name === this.name) {
          return editor.commands.deleteSelection()
        }
        return false
      }
    }
  },

  addPasteRules() {
    return []
  },

  addProseMirrorPlugins() {
    const extension = this

    return [
      new Plugin({
        key: EMBED_KEY,
        props: {
          handlePaste(view, event) {
            const text = event.clipboardData?.getData("text/plain")
            if (!text) return false

            // Check if it's a URL
            const urlPattern = /^https?:\/\/[^\s]+$/
            if (!urlPattern.test(text.trim())) return false

            const url = text.trim()
            const detected = detectProvider(url)

            // Only handle if it's a known provider or link cards are enabled
            if (detected || extension.options.enableLinkCards) {
              event.preventDefault()
              extension.editor.commands.insertEmbed(url)
              return true
            }

            return false
          }
        }
      })
    ]
  }
})

// Helper: Render iframe embed
function renderIframe(container, node, config) {
  const { url, embedData } = node.attrs
  let embedUrl

  if (config.useFullUrl) {
    embedUrl = config.getEmbedUrl(url)
  } else if (config.extractId) {
    const match = [null, ...Object.values(embedData)]
    embedUrl = config.getEmbedUrl(match)
  } else {
    embedUrl = config.getEmbedUrl(embedData)
  }

  const wrapper = document.createElement("div")
  wrapper.className = "inkpen-embed__wrapper"

  if (config.aspectRatio) {
    wrapper.style.aspectRatio = config.aspectRatio
  }
  if (config.maxWidth) {
    wrapper.style.maxWidth = `${config.maxWidth}px`
  }
  if (config.height) {
    wrapper.style.height = `${config.height}px`
  }

  const iframe = document.createElement("iframe")
  iframe.src = embedUrl
  iframe.frameBorder = "0"
  iframe.allowFullscreen = true
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  iframe.loading = "lazy"

  wrapper.appendChild(iframe)
  container.appendChild(wrapper)
}

// Helper: Render widget (Twitter, Instagram)
function renderWidget(container, node, config) {
  const wrapper = document.createElement("div")
  wrapper.className = "inkpen-embed__wrapper inkpen-embed__wrapper--widget"

  if (config.name === "Twitter") {
    const { user, id } = node.attrs.embedData
    wrapper.innerHTML = `
      <blockquote class="twitter-tweet" data-conversation="none">
        <a href="https://twitter.com/${user}/status/${id}">Loading tweet...</a>
      </blockquote>
    `
    loadScript(config.widgetScript, () => {
      if (window.twttr?.widgets) {
        window.twttr.widgets.load(wrapper)
      }
    })
  } else if (config.name === "Instagram") {
    const { type, id } = node.attrs.embedData
    wrapper.innerHTML = `
      <blockquote class="instagram-media" data-instgrm-captioned
        data-instgrm-permalink="https://www.instagram.com/${type}/${id}/">
        <a href="https://www.instagram.com/${type}/${id}/">Loading Instagram...</a>
      </blockquote>
    `
    loadScript(config.widgetScript, () => {
      if (window.instgrm?.Embeds) {
        window.instgrm.Embeds.process(wrapper)
      }
    })
  }

  container.appendChild(wrapper)
}

// Helper: Render script embed (Gist)
function renderScript(container, node, config) {
  const wrapper = document.createElement("div")
  wrapper.className = "inkpen-embed__wrapper inkpen-embed__wrapper--script"

  const { user, id } = node.attrs.embedData
  const scriptUrl = config.getScriptUrl([null, user, id])

  // Create iframe to sandbox the gist
  const iframe = document.createElement("iframe")
  iframe.className = "inkpen-embed__gist-frame"
  iframe.frameBorder = "0"
  iframe.scrolling = "no"

  iframe.onload = () => {
    const doc = iframe.contentDocument
    if (doc) {
      doc.open()
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <base target="_blank">
          <style>
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
            .gist .gist-file { border: none !important; }
            .gist .gist-meta { display: none !important; }
          </style>
        </head>
        <body>
          <script src="${scriptUrl}"></script>
        </body>
        </html>
      `)
      doc.close()

      // Resize iframe to content
      setTimeout(() => {
        const height = doc.body.scrollHeight
        iframe.style.height = `${height}px`
      }, 500)
    }
  }

  wrapper.appendChild(iframe)
  container.appendChild(wrapper)
}

// Helper: Render link card
function renderLinkCard(container, node, editor, getPos) {
  const { url, linkCard } = node.attrs
  const data = linkCard || { domain: extractDomain(url) }

  container.innerHTML = `
    <a href="${url}" target="_blank" rel="noopener noreferrer" class="inkpen-link-card">
      ${data.image ? `<img src="${data.image}" alt="" class="inkpen-link-card__image">` : ""}
      <div class="inkpen-link-card__content">
        <span class="inkpen-link-card__title">${data.title || url}</span>
        ${data.description ? `<span class="inkpen-link-card__description">${data.description}</span>` : ""}
        <span class="inkpen-link-card__domain">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          ${data.domain}
        </span>
      </div>
    </a>
  `
}

// Helper: Load external script
const loadedScripts = new Set()

function loadScript(src, callback) {
  if (loadedScripts.has(src)) {
    callback?.()
    return
  }

  const script = document.createElement("script")
  script.src = src
  script.async = true
  script.onload = () => {
    loadedScripts.add(src)
    callback?.()
  }
  document.body.appendChild(script)
}

export default Embed
