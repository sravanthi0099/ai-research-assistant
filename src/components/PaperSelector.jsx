import { useMemo } from 'react';

/**
 * Reusable paper selection list used across Summary, Literature Review, and Gap Analysis pages.
 */
export default function PaperSelector({
    collection,
    selectedIds,
    onToggle,
    onSelectAll,
    onAction,
    actionLabel,
    actionIcon = '⚡',
    minRequired = 1,
    children,
}) {
    const selectedCount = selectedIds.size;
    const allSelected = selectedCount === collection.length && collection.length > 0;

    return (
        <div className="card" style={{ marginBottom: 24 }}>
            <div className="selector-header">
                <h3>Select Papers</h3>
                <div className="selector-actions">
                    {children}
                    <button className="btn btn-ghost btn-sm" onClick={onSelectAll}>
                        {allSelected ? '☐ Deselect All' : '☑ Select All'}
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        disabled={selectedCount < minRequired}
                        onClick={onAction}
                    >
                        {actionIcon} {actionLabel} ({selectedCount})
                    </button>
                </div>
            </div>

            {minRequired > 1 && selectedCount > 0 && selectedCount < minRequired && (
                <div className="selector-warning">
                    ⚠️ Select at least {minRequired} papers for meaningful analysis
                </div>
            )}

            <div className="paper-select-list">
                {collection.map(paper => (
                    <div
                        key={paper.paperId}
                        className={`paper-select-item ${selectedIds.has(paper.paperId) ? 'selected' : ''}`}
                        onClick={() => onToggle(paper.paperId)}
                    >
                        <div className="checkbox">{selectedIds.has(paper.paperId) ? '✓' : ''}</div>
                        <div className="paper-info">
                            <div className="paper-title">{paper.title}</div>
                            <div className="paper-authors">
                                {paper.authors?.slice(0, 3).map(a => a.name).join(', ')} • {paper.year || 'N/A'} • {paper.citationCount ?? 0} citations
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
