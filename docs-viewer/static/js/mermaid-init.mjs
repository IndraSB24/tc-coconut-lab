// mermaid-init.mjs — loads mermaid from CDN and renders fenced `mermaid` code blocks
// Dynamically load the UMD bundle from CDN to avoid bundler attempting to resolve an https: import
function loadMermaid() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Not in a browser'))
    // @ts-ignore
    if (window.mermaid) return resolve(window.mermaid)
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
    script.async = true
    script.onload = () => {
      // @ts-ignore
      resolve(window.mermaid)
    }
    script.onerror = () => reject(new Error('Failed to load mermaid'))
    document.head.appendChild(script)
  })
}

console.log('[mermaid-init] loading mermaid from CDN')

function transformMermaidCode(codeEl) {
  if (!codeEl) return
  // avoid double-processing
  const already = codeEl.closest('[data-mermaid-processed]')
  if (already) return

  const parentPre = codeEl.closest('pre')
  const diagramText = codeEl.textContent || ''
  const wrapper = document.createElement('div')
  wrapper.className = 'mermaid'
  wrapper.textContent = diagramText

  if (parentPre && parentPre.parentNode) {
    parentPre.parentNode.replaceChild(wrapper, parentPre)
  } else if (codeEl.parentNode) {
    codeEl.parentNode.replaceChild(wrapper, codeEl)
  }
  // mark container to avoid reprocessing
  wrapper.setAttribute('data-mermaid-processed', '1')
}

function renderMermaidBlocks(root = document) {
  console.log(
    '[mermaid-init] scanning for mermaid blocks in',
    root === document ? 'document' : root,
  )

  // Select any code blocks where the class contains 'language-mermaid'
  const codeBlocks = Array.from(
    root.querySelectorAll('pre > code[class*="language-mermaid"], code[class*="language-mermaid"]'),
  )
  console.log('[mermaid-init] found', codeBlocks.length, 'code blocks to transform')
  codeBlocks.forEach(transformMermaidCode)

  // Find all existing .mermaid divs (both from transformation and JSX)
  const mermaidDivs = document.querySelectorAll('.mermaid:not([data-processed="true"])')
  console.log('[mermaid-init] found', mermaidDivs.length, '.mermaid divs to render')

  if (mermaidDivs.length > 0) {
    // Mark all as processed before rendering
    mermaidDivs.forEach((div) => div.setAttribute('data-processed', 'true'))

    // Render using mermaid.run() which is the modern API
    try {
      // Use window.mermaid to avoid referencing an undefined local variable
      // @ts-ignore
      window.mermaid
        .run({ nodes: mermaidDivs })
        .then(() =>
          console.log('[mermaid-init] Successfully rendered', mermaidDivs.length, 'diagrams'),
        )
        .catch((err) => console.error('[mermaid-init] Mermaid render error:', err))
    } catch (err) {
      console.error('[mermaid-init] Mermaid render error (sync):', err)
    }
  }
}

// Render once on initial load (with delay for React hydration)
function initRender() {
  console.log('[mermaid-init] Initial render attempt')
  renderMermaidBlocks(document)

  // Retry after a delay in case React hasn't hydrated yet
  setTimeout(() => {
    console.log('[mermaid-init] Delayed retry')
    renderMermaidBlocks(document)
  }, 500)

  // Another retry for slower systems
  setTimeout(() => {
    console.log('[mermaid-init] Final retry')
    renderMermaidBlocks(document)
  }, 1500)
}

// Wait for mermaid to be available, then initialize and run initial rendering
loadMermaid()
  .then((m) => {
    try {
      m.initialize({ startOnLoad: false, theme: 'neutral' })
    } catch (e) {
      console.warn('[mermaid-init] initialize() failed:', e)
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initRender)
    } else {
      initRender()
    }
  })
  .catch((err) => console.error('[mermaid-init] failed to load mermaid:', err))

// Observe DOM changes (useful for SPA navigation / MDX hydration)
const observer = new MutationObserver((mutations) => {
  let shouldRender = false
  for (const m of mutations) {
    if (m.addedNodes && m.addedNodes.length) {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          // Check if the added node is or contains a .mermaid element
          if (node.classList?.contains('mermaid') || node.querySelector?.('.mermaid')) {
            shouldRender = true
          }
        }
      })
    }
  }
  if (shouldRender) {
    console.log('[mermaid-init] DOM mutation detected with .mermaid elements')
    setTimeout(() => renderMermaidBlocks(document), 100)
  }
})
observer.observe(document.body || document, { childList: true, subtree: true })

// Also re-run on history navigation (Docusaurus SPA)
;(() => {
  const push = history.pushState
  history.pushState = function () {
    push.apply(this, arguments)
    setTimeout(() => renderMermaidBlocks(document), 50)
  }
  window.addEventListener('popstate', () => setTimeout(() => renderMermaidBlocks(document), 50))
})()
