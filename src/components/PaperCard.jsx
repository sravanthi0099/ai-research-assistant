/**
 * Reusable paper card component for search results.
 */
export default function PaperCard({ paper, isCollected, onToggle, onViewDetail }) {
    return (
        <div className="card paper-card" onClick={() => onViewDetail?.(paper)}>
            <div className="card-header">
                <h3 className="card-title">{paper.title}</h3>
                <button
                    className={`btn btn-sm ${isCollected ? 'btn-danger' : 'btn-success'}`}
                    onClick={(e) => { e.stopPropagation(); onToggle(paper); }}
                >
                    {isCollected ? '✕ Remove' : '+ Collect'}
                </button>
            </div>

            <div className="card-meta">
                {paper.year && <span>📅 {paper.year}</span>}
                {paper.venue && <span>📖 {paper.venue}</span>}
                <span>📊 {paper.citationCount ?? 0} citations</span>
                {paper.authors && (
                    <span>
                        👤 {paper.authors.slice(0, 3).map(a => a.name).join(', ')}
                        {paper.authors.length > 3 ? ' et al.' : ''}
                    </span>
                )}
            </div>

            {paper.abstract && (
                <p className="card-abstract">{paper.abstract}</p>
            )}

            <div className="card-tags">
                {paper.isOpenAccess && <span className="tag open-access">Open Access</span>}
                {(paper.fieldsOfStudy || []).slice(0, 3).map(f => (
                    <span key={f} className="tag">{f}</span>
                ))}
                {paper.referenceCount > 0 && (
                    <span className="tag">📄 {paper.referenceCount} refs</span>
                )}
            </div>
        </div>
    );
}
