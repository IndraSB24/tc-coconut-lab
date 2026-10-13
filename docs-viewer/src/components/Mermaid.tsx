import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

interface MermaidProps {
  chart: string;
  withCard?: boolean;
  /** @deprecated Replaced by integrated Copy Code button and modal toolbar */
  showSource?: boolean;
}

const Mermaid: React.FC<MermaidProps> = ({ chart, withCard = false, showSource = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Interactive Lightbox / Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [svgHtml, setSvgHtml] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(chart.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    let cleanupToggle: (() => void) | undefined;

    const renderDiagram = async () => {
      try {
        if (typeof window === 'undefined' || isCancelled) return;
        setError(null);

        const loadMermaid = (): Promise<any> =>
          new Promise((resolve, reject) => {
            // @ts-ignore
            if (window.mermaid) return resolve(window.mermaid);
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
            script.async = true;
            script.onload = () => {
              // @ts-ignore
              resolve(window.mermaid);
            };
            script.onerror = () => reject(new Error('Failed to load mermaid from CDN'));
            document.head.appendChild(script);
          });

        const mermaid = await loadMermaid();

        if (ref.current && !isCancelled) {
          ref.current.removeAttribute('data-processed');
          ref.current.textContent = chart;
          mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
          await mermaid.run({ nodes: [ref.current] });
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Mermaid render error:', err);
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      }
    };

    const detailsParent = ref.current?.closest('details');
    if (detailsParent && !detailsParent.open) {
      const handleToggle = () => {
        if (detailsParent.open) {
          renderDiagram();
        }
      };
      detailsParent.addEventListener('toggle', handleToggle, { once: true });
      cleanupToggle = () => detailsParent.removeEventListener('toggle', handleToggle);
    } else {
      renderDiagram();
    }

    return () => {
      isCancelled = true;
      if (cleanupToggle) cleanupToggle();
    };
  }, [chart]);

  // Open Modal Handler
  const openModal = () => {
    if (ref.current) {
      let rawSvg = ref.current.innerHTML;
      rawSvg = rawSvg.replace(/style="[^"]*max-width:[^"]*"/gi, 'style="width: 100%; height: auto; max-height: calc(100vh - 140px);"');
      setSvgHtml(rawSvg);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDragging(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Keyboard shortcut (ESC), scroll lock, and native wheel zoom
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const modalEl = modalRef.current;
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      setZoom((prev) => Math.min(Math.max(0.2, prev * zoomFactor), 6));
    };

    if (modalEl) {
      modalEl.addEventListener('wheel', handleNativeWheel, { passive: false });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      if (modalEl) {
        modalEl.removeEventListener('wheel', handleNativeWheel);
      }
    };
  }, [isModalOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoom((z) => Math.min(6, z * 1.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.2, z * 0.8));

  if (error) {
    return (
      <div
        style={{
          padding: '1rem',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
        }}
      >
        <strong>Mermaid Error:</strong> {error}
      </div>
    );
  }

  const mermaidDiagram = <div ref={ref} className="mermaid" />;

  const content = withCard ? (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#ffffff',
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
      }}
    >
      {/* Floating Action Buttons */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 5,
        }}
      >
        <button
          type="button"
          onClick={handleCopy}
          title="Copy Mermaid source"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 9px',
            fontSize: '11px',
            fontWeight: 600,
            color: copied ? '#15803d' : '#334155',
            backgroundColor: copied ? '#dcfce7' : '#f1f5f9',
            border: `1px solid ${copied ? '#86efac' : '#cbd5e1'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.15s ease',
          }}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy Code</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={openModal}
          title="Click to expand / Fullscreen"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 9px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#334155',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          <span>Fullscreen</span>
        </button>
      </div>

      {/* Normal Diagram Container */}
      <div style={{ userSelect: 'text', cursor: 'default' }}>
        {mermaidDiagram}
      </div>
    </div>
  ) : (
    <div style={{ position: 'relative', userSelect: 'text', cursor: 'default' }}>
      {mermaidDiagram}
    </div>
  );

  return (
    <>
      {content}

      {/* Fullscreen Interactive Lightbox Modal */}
      {isModalOpen &&
        typeof document !== 'undefined' &&
        ReactDOM.createPortal(
          <div
            ref={modalRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(6px)',
              zIndex: 99999,
              overflow: 'hidden',
              userSelect: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Top Toolbar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '52px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 20px',
                backgroundColor: 'rgba(30, 41, 59, 0.98)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                zIndex: 100001,
                boxSizing: 'border-box',
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#94a3b8',
                }}
              >
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>🔍 Interactive Diagram</span>
                <span>•</span>
                <span>Scroll to Zoom</span>
                <span>•</span>
                <span>Drag to Pan</span>
                <span>•</span>
                <span>Double-click to Reset</span>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy Mermaid source"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    backgroundColor: copied ? '#15803d' : '#334155',
                    border: `1px solid ${copied ? '#86efac' : '#475569'}`,
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy Code'}
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  style={{
                    padding: '5px 11px',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    minWidth: '46px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#cbd5e1',
                  }}
                >
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  style={{
                    padding: '5px 11px',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset Zoom & Pan"
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  title="Close (Esc)"
                  style={{
                    marginLeft: '8px',
                    padding: '5px 14px',
                    backgroundColor: '#ef4444',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Interactive Canvas */}
            <div
              onDoubleClick={handleReset}
              style={{
                position: 'absolute',
                top: '52px',
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isDragging ? 'grabbing' : 'grab',
                padding: '24px',
                boxSizing: 'border-box',
                zIndex: 100000,
              }}
            >
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.08s ease-out',
                  backgroundColor: '#ffffff',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                  width: 'min(90vw, 1360px)',
                  maxHeight: 'calc(100vh - 120px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <style>{`
                  .mermaid-modal-canvas svg {
                    width: 100% !important;
                    height: auto !important;
                    max-height: calc(100vh - 170px) !important;
                    max-width: 100% !important;
                    display: block !important;
                    margin: 0 auto !important;
                  }
                `}</style>
                <div
                  className="mermaid-modal-canvas"
                  dangerouslySetInnerHTML={{ __html: svgHtml }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export { Mermaid };
export default Mermaid;
