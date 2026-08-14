import { useState, useMemo } from 'react';
import { generateLiteratureReview } from '../utils/reviewGenerator';
import PaperSelector from '../components/PaperSelector';
import StatRow from '../components/StatRow';
import ExportButton from '../components/ExportButton';

export default function LiteratureReviewPage({ collection }) {
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [citationStyle, setCitationStyle] = useState('apa');
    const [review, setReview] = useState(null);
    const [activeTab, setActiveTab] = useState('review');
    const [showExport, setShowExport] = useState(false);

    const toggleSelect = (paperId) => {
        const next = new Set(selectedIds);
        if (next.has(paperId)) next.delete(paperId);
        else next.add(paperId);
        setSelectedIds(next);
    };

    const selectAll = () => {
        if (selectedIds.size === collection.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(collection.map(p => p.paperId)));
    };

    const selectedPapers = useMemo(
        () => collection.filter(p => selectedIds.has(p.paperId)),
        [collection, selectedIds]
    );

    const handleGenerate = () => {
        const result = generateLiteratureReview(selectedPapers, citationStyle);
        setReview(result);
        setShowExport(false);
    };

    const exportText = useMemo(() => {
        if (!review) return '';
        let text = '# Literature Review\n\n';
        text += '## Introduction\n\n';
        text += review.introduction + '\n\n';
        review.sections.forEach(s => {
            text += `## ${s.title}\n\n`;
            text += s.narrative + '\n\n';
        });
        if (review.methodology) {
            text += '## Methodology Overview\n\n';
            text += review.methodology + '\n\n';
        }
        text += '## References\n\n';
        review.references.forEach(r => {
            text += `[${r.number}] ${r.citation}\n\n`;
        });
        return text;
    }, [review]);

    if (collection.length === 0) {
        return (
            <div className="animate-fadeIn">
                <div className="page-header">
                    <h1>📖 Literature Review</h1>
                    <p>Auto-generate structured literature reviews from your collection</p>
                </div>
                <div className="empty-state">
                    <div className="empty-icon">📕</div>
                    <h3>No papers in collection</h3>
                    <p>Search and add papers to your collection first, then generate a literature review.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h1>📖 Literature Review</h1>
                <p>Auto-generate structured literature reviews from your collection</p>
            </div>

            <PaperSelector
                collection={collection}
                selectedIds={selectedIds}
                onToggle={toggleSelect}
                onSelectAll={selectAll}
                onAction={handleGenerate}
                actionLabel="Generate Review"
                actionIcon="📖"
            >
                <div className="filter-group">
                    <label>Citation Style</label>
                    <select
                        className="input-field"
                        value={citationStyle}
                        onChange={(e) => setCitationStyle(e.target.value)}
                        style={{ width: 120 }}
                    >
                        <option value="apa">APA</option>
                        <option value="mla">MLA</option>
                        <option value="chicago">Chicago</option>
                    </select>
                </div>
            </PaperSelector>

            {review && (
                <div className="animate-fadeInUp">
                    <StatRow stats={[
                        { value: review.stats.totalPapers, label: 'Papers Reviewed' },
                        { value: review.stats.totalCitations, label: 'Total Citations' },
                        { value: review.stats.themeCount, label: 'Themes Found' },
                        { value: review.stats.methodCount, label: 'Methods Used' },
                    ]} />

                    <div className="tabs">
                        <button className={`tab ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
                            📝 Review
                        </button>
                        <button className={`tab ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
                            📅 Timeline
                        </button>
                        <button className={`tab ${activeTab === 'references' ? 'active' : ''}`} onClick={() => setActiveTab('references')}>
                            📚 References
                        </button>
                    </div>

                    {activeTab === 'review' && (
                        <div className="card">
                            <div className="analysis-section">
                                <h3>📋 Introduction</h3>
                                <div className="analysis-content">
                                    <p>{review.introduction}</p>
                                </div>
                            </div>

                            {review.sections.map((section, i) => (
                                <div key={i} className="analysis-section">
                                    <h3>📌 {section.title}</h3>
                                    <div className="analysis-content">
                                        <p>{section.narrative}</p>
                                        <div className="card-tags" style={{ marginTop: 8 }}>
                                            {section.papers.map(p => (
                                                <span key={p.paperId} className="tag">{p.year}: {p.title?.substring(0, 40)}...</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {review.methodology && (
                                <div className="analysis-section">
                                    <h3>🔬 Methodology Overview</h3>
                                    <div className="analysis-content">
                                        <p>{review.methodology}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="card">
                            <h3 style={{ marginBottom: 20 }}>📅 Publication Timeline</h3>
                            <div className="timeline">
                                {selectedPapers
                                    .filter(p => p.year)
                                    .sort((a, b) => (a.year || 0) - (b.year || 0))
                                    .map((paper, i) => (
                                        <div key={i} className="timeline-item">
                                            <div className="timeline-year">{paper.year}</div>
                                            <div className="timeline-title">{paper.title}</div>
                                            <div className="timeline-authors">
                                                {paper.authors?.slice(0, 3).map(a => a.name).join(', ')}
                                                {' • '}{paper.citationCount ?? 0} citations
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'references' && (
                        <div className="card">
                            <h3 style={{ marginBottom: 16 }}>📚 References ({citationStyle.toUpperCase()} Style)</h3>
                            {review.references.map(ref => (
                                <div key={ref.number} className="citation-item">
                                    <span className="citation-number">[{ref.number}]</span>
                                    {ref.citation}
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ marginTop: 20 }}>
                        <ExportButton
                            text={exportText}
                            filename="literature-review.md"
                            showExport={showExport}
                            onToggleExport={setShowExport}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
