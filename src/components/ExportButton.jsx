import { useToast } from './Toast';

/**
 * Reusable export button with copy-to-clipboard and download-to-file capabilities.
 */
export default function ExportButton({ text, filename = 'export.md', showExport, onToggleExport }) {
    const toast = useToast();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard!');
        } catch {
            toast.error('Failed to copy. Try again.');
        }
    };

    const handleDownload = () => {
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded ${filename}`);
    };

    return (
        <div className="export-actions">
            <div className="export-buttons">
                <button className="btn btn-secondary btn-sm" onClick={() => onToggleExport?.(!showExport)}>
                    {showExport ? '✕ Hide Preview' : '👁 Preview'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
                    📋 Copy
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleDownload}>
                    ⬇ Download .md
                </button>
            </div>

            {showExport && (
                <div className="export-panel animate-fadeIn">
                    <h4>Export Preview</h4>
                    <div className="export-content">{text}</div>
                </div>
            )}
        </div>
    );
}
