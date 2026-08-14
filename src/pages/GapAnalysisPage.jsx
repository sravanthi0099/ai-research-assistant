import { useState, useMemo } from 'react';
import { performGapAnalysis } from '../utils/gapAnalyzer';
import PaperSelector from '../components/PaperSelector';
import StatRow from '../components/StatRow';
import ExportButton from '../components/ExportButton';

export default function GapAnalysisPage({ collection }) {
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [analysis, setAnalysis] = useState(null);
    const [activeTab, setActiveTab] = useState('gaps');
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

    const handleAnalyze = () => {
        const result = performGapAnalysis(selectedPapers);
        setAnalysis(result);
    };

    const exportText = useMemo(() => {
        if (!analysis) return '';
        let text = '# Research Gap Analysis\n\n';
        text += `**Total Gaps:** ${analysis.summary.totalGaps}\n`;
        text += `**High Severity:** ${analysis.summary.highSeverity}\n\n`;
        text += '## Identified Gaps\n\n';
        analysis.gaps.forEach((g, i) => {
            text += `### ${i + 1}. ${g.title}\n`;
            text += `**Type:** ${g.type} | **Severity:** ${g.severity}\n\n`;
            text += `${g.description}\n\n`;
        });
        text += '## Suggestions\n\n';
        analysis.suggestions.forEach((s, i) => {
            text += `### ${i + 1}. ${s.title}\n`;
            text += `**Priority:** ${s.priority}\n\n`;
            text += `${s.description}\n\n`;
        });
        text += '## Topic Coverage\n\n';
        analysis.topicFrequency.slice(0, 15).forEach(t => {
            text += `- **${t.topic}**: ${t.papers} papers (${t.percentage}%)\n`;
        });
        return text;
    }, [analysis]);

    if (collection.length === 0) {
        return (
            <div className="animate-fadeIn">
                <div className="page-header">
                    <h1>🔬 Gap Analysis</h1>
                    <p>Identify research gaps and future opportunities</p>
                </div>
                <div className="empty-state">
                    <div className="empty-icon">🧪</div>
                    <h3>No papers in collection</h3>
                    <p>Search and add papers to your collection first, then analyze for research gaps.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h1>🔬 Gap Analysis</h1>
                <p>Identify research gaps and future opportunities</p>
            </div>

            <PaperSelector
                collection={collection}
                selectedIds={selectedIds}
                onToggle={toggleSelect}
                onSelectAll={selectAll}
                onAction={handleAnalyze}
                actionLabel="Analyze Gaps"
                actionIcon="🔬"
                minRequired={2}
            />

            {analysis && (
                <div className="animate-fadeInUp">
                    <StatRow stats={[
                        { value: analysis.summary.totalGaps, label: 'Gaps Identified' },
                        { value: analysis.summary.highSeverity, label: 'High Severity' },
                        { value: analysis.suggestions.length, label: 'Suggestions' },
                        { value: analysis.topicFrequency.length, label: 'Topics Tracked' },
                    ]} />

                    <div className="tabs">
                        <button className={`tab ${activeTab === 'gaps' ? 'active' : ''}`} onClick={() => setActiveTab('gaps')}>
                            🕳️ Gaps ({analysis.gaps.length})
                        </button>
                        <button className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`} onClick={() => setActiveTab('suggestions')}>
                            💡 Suggestions ({analysis.suggestions.length})
                        </button>
                        <button className={`tab ${activeTab === 'topics' ? 'active' : ''}`} onClick={() => setActiveTab('topics')}>
                            📊 Topic Coverage
                        </button>
                    </div>

                    {activeTab === 'gaps' && (
                        <div className="stagger-children">
                            {analysis.gaps.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">✅</div>
                                    <h3>No significant gaps found</h3>
                                    <p>The selected papers appear to have good coverage.</p>
                                </div>
                            ) : (
                                analysis.gaps.map((gap, i) => (
                                    <div key={i} className="gap-card">
                                        <span className={`gap-type-badge ${gap.type}`}>{gap.type}</span>
                                        <h4>{gap.title}</h4>
                                        <p>{gap.description}</p>
                                        <div style={{ marginTop: 8 }}>
                                            <span className="tag" style={{
                                                background: gap.severity === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                                color: gap.severity === 'high' ? '#ef4444' : '#f59e0b',
                                                borderColor: gap.severity === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'
                                            }}>
                                                {gap.severity === 'high' ? '🔴' : '🟡'} {gap.severity} severity
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'suggestions' && (
                        <div className="stagger-children">
                            {analysis.suggestions.map((suggestion, i) => (
                                <div key={i} className="card" style={{ marginBottom: 16, borderLeft: '3px solid var(--success)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <span style={{ fontSize: '1.2rem' }}>💡</span>
                                        <h3 style={{ fontSize: '1rem' }}>{suggestion.title}</h3>
                                        <span className="tag" style={{
                                            marginLeft: 'auto',
                                            background: suggestion.priority === 'high' ? 'rgba(99,102,241,0.1)' : 'rgba(6,182,212,0.1)',
                                            color: suggestion.priority === 'high' ? 'var(--accent-tertiary)' : 'var(--info)',
                                            borderColor: suggestion.priority === 'high' ? 'rgba(99,102,241,0.2)' : 'rgba(6,182,212,0.2)'
                                        }}>
                                            {suggestion.priority} priority
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                        {suggestion.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'topics' && (
                        <div className="card">
                            <h3 style={{ marginBottom: 20 }}>📊 Topic Frequency Distribution</h3>
                            {analysis.topicFrequency.slice(0, 15).map((topic, i) => (
                                <div key={i} className="topic-bar">
                                    <span className="topic-name">{topic.topic}</span>
                                    <div className="bar-container">
                                        <div className="bar-fill" style={{ width: `${topic.percentage}%` }} />
                                    </div>
                                    <span className="bar-count">{topic.papers}</span>
                                </div>
                            ))}
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 16, textAlign: 'center' }}>
                                Bar length shows relative topic frequency • Numbers indicate papers mentioning each topic
                            </p>
                        </div>
                    )}

                    <div style={{ marginTop: 20 }}>
                        <ExportButton
                            text={exportText}
                            filename="gap-analysis.md"
                            showExport={showExport}
                            onToggleExport={setShowExport}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
