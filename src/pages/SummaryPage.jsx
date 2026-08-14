import { useState, useMemo } from 'react';
import { generateSummary } from '../utils/summarizer';
import PaperSelector from '../components/PaperSelector';
import StatRow from '../components/StatRow';
import ExportButton from '../components/ExportButton';

export default function SummaryPage({ collection }) {
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [summary, setSummary] = useState(null);
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
        const result = generateSummary(selectedPapers);
        setSummary(result);
        setShowExport(false);
    };

    const exportText = useMemo(() => {
        if (!summary) return '';
        let text = '# Research Summary\n\n';
        text += `**Papers Analyzed:** ${summary.stats.totalPapers}\n`;
        text += `**Year Range:** ${summary.stats.yearRange}\n`;
        text += `**Average Citations:** ${summary.stats.avgCitations}\n`;
        text += `**Fields of Study:** ${summary.stats.fieldsOfStudy.join(', ')}\n\n`;
        text += '## Overview\n\n';
        text += summary.overview + '\n\n';
        text += '## Key Topics\n\n';
        text += summary.keywords.map(k => `- **${k.word}** (score: ${k.score})`).join('\n') + '\n\n';
        if (summary.methods.length) {
            text += '## Methods Detected\n\n';
            text += summary.methods.map(m => `- ${m}`).join('\n') + '\n\n';
        }
        text += '## Key Findings\n\n';
        text += summary.keySentences.map((s, i) => `${i + 1}. ${s}`).join('\n');
        return text;
    }, [summary]);

    if (collection.length === 0) {
        return (
            <div className="animate-fadeIn">
                <div className="page-header">
                    <h1>📝 Summary Generator</h1>
                    <p>Generate structured summaries from your paper collection</p>
                </div>
                <div className="empty-state">
                    <div className="empty-icon">📄</div>
                    <h3>No papers in collection</h3>
                    <p>Search and add papers to your collection first, then come back to generate summaries.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h1>📝 Summary Generator</h1>
                <p>Generate structured summaries from your paper collection</p>
            </div>

            <PaperSelector
                collection={collection}
                selectedIds={selectedIds}
                onToggle={toggleSelect}
                onSelectAll={selectAll}
                onAction={handleGenerate}
                actionLabel="Generate Summary"
                actionIcon="⚡"
            />

            {summary && (
                <div className="animate-fadeInUp">
                    <StatRow stats={[
                        { value: summary.stats.totalPapers, label: 'Papers Analyzed' },
                        { value: summary.stats.avgCitations, label: 'Avg Citations' },
                        { value: summary.keywords.length, label: 'Key Topics' },
                        { value: summary.methods.length, label: 'Methods Found' },
                    ]} />

                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="analysis-section">
                            <h3>📋 Overview</h3>
                            <div className="analysis-content">
                                <p>{summary.overview}</p>
                            </div>
                        </div>

                        <div className="analysis-section">
                            <h3>🏷️ Key Topics</h3>
                            <div style={{ marginTop: 8 }}>
                                {summary.keywords.map((k, i) => (
                                    <div key={i} className="topic-bar">
                                        <span className="topic-name">{k.word}</span>
                                        <div className="bar-container">
                                            <div className="bar-fill" style={{ width: `${(k.score / summary.keywords[0].score) * 100}%` }} />
                                        </div>
                                        <span className="bar-count">{k.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {summary.methods.length > 0 && (
                            <div className="analysis-section">
                                <h3>🔬 Methods Detected</h3>
                                <div className="card-tags" style={{ marginTop: 8 }}>
                                    {summary.methods.map((m, i) => (
                                        <span key={i} className="tag">{m}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="analysis-section">
                            <h3>💡 Key Findings</h3>
                            <div className="analysis-content">
                                <ul>
                                    {summary.keySentences.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {summary.stats.fieldsOfStudy.length > 0 && (
                            <div className="analysis-section">
                                <h3>🎓 Fields of Study</h3>
                                <div className="card-tags" style={{ marginTop: 8 }}>
                                    {summary.stats.fieldsOfStudy.map((f, i) => (
                                        <span key={i} className="tag">{f}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <ExportButton
                        text={exportText}
                        filename="research-summary.md"
                        showExport={showExport}
                        onToggleExport={setShowExport}
                    />
                </div>
            )}
        </div>
    );
}
