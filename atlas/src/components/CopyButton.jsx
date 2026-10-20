/* Tombol salin teks ke clipboard (ikon berubah jadi centang sesaat) */
(function () {
  const { useState } = React;
  const { Icon } = ATLAS.components;
  function CopyButton({ text, title = 'Salin', label = '', className = '' }) {
    const [done, setDone] = useState(false);
    const copy = async (e) => {
      e.stopPropagation();
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text || '');
        } else { // fallback untuk konteks non-HTTPS
          const ta = document.createElement('textarea');
          ta.value = text || ''; ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
        }
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      } catch (err) { console.warn('Gagal menyalin:', err); }
    };
    return (
      <button type="button" onClick={copy} title={done ? 'Tersalin!' : title} aria-label={title}
        className={`inline-flex items-center gap-1 p-1 rounded transition ${done ? 'text-emerald-600' : 'text-mutedText hover:text-accent'} ${className}`}>
        <Icon name={done ? 'check' : 'copy'} className="w-4 h-4" />
        {label && <span className="text-[10px] font-mono">{done ? 'Tersalin' : label}</span>}
      </button>
    );
  }
  ATLAS.components.CopyButton = CopyButton;
})();
