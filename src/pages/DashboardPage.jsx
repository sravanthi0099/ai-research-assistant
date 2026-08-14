import { useMemo } from 'react';
import { Link } from 'react-router-dom';

/**
 * Dashboard landing page with collection stats, quick actions, and recent papers.
 */
export default function DashboardPage({ collection }) {
    const stats = useMemo(() => {
        const totalCitations = collection.reduce((s, p) => s + (p.citationCount || 0), 0);
        const years = collection.map(p => p.year).filter(Boolean).sort();
        const fields = new Set();
        collection.forEach(p => (p.fieldsOfStudy || []).forEach(f => fields.add(f)));
        const openAccess = collection.filter(p => p.isOpenAccess).length;
        return { totalCitations, yearRange: years.length ? `${years[0]}–${years[years.length - 1]}` : 'N/A', fieldsCount: fields.size, openAccess };
    }, [collection]);

    return (
        <div className="animate-fadeIn">
            <div className="dashboard-hero">
                <div className="dashboard-hero-content">
                    <h1 className="dashboard-title">
                        <span className="gradient-text">ResearchAI</span>
                    </h1>
                    <p className="dashboard-subtitle">
                        Your AI-powered academic paper analysis assistant. Search, summarize, review, and discover research gaps.
                    </p>
                    <div className="dashboard-hero-actions">
                        <Link to="/search" className="btn btn-primary">
                            🔍 Start Searching
                        </Link>
                        {collection.length > 0 && (
                            <Link to="/summaries" className="btn btn-secondary">
                                📝 Generate Summary
                            </Link>
                        )}
                    </div>
                </div>
                <div className="dashboard-hero-visual">
                    <div className="floating-orb orb-1" />
                    <div className="floating-orb orb-2" />
                    <div className="floating-orb orb-3" />
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-value">{collection.length}</div>
                    <div className="stat-label">Papers Collected</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalCitations.toLocaleString()}</div>
                    <div className="stat-label">Total Citations</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.fieldsCount}</div>
                    <div className="stat-label">Research Fields</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.openAccess}</div>
                    <div className="stat-label">Open Access</div>
                </div>
            </div>

            <div className="action-cards-grid">
                <Link to="/search" className="action-card">
                    <div className="action-icon">🔍</div>
                    <h3>Paper Search</h3>
                    <p>Search millions of papers via Semantic Scholar with advanced filters</p>
                </Link>
                <Link to="/summaries" className="action-card">
                    <div className="action-icon">📝</div>
                    <h3>AI Summaries</h3>
                    <p>Generate structured summaries with keyword extraction and method detection</p>
                </Link>
                <Link to="/review" className="action-card">
                    <div className="action-icon">📖</div>
                    <h3>Literature Review</h3>
                    <p>Auto-generate themed reviews with APA, MLA, or Chicago citations</p>
                </Link>
                <Link to="/gaps" className="action-card">
                    <div className="action-icon">🔬</div>
                    <h3>Gap Analysis</h3>
                    <p>Identify topical, methodological, temporal, and empirical research gaps</p>
                </Link>
            </div>

            {collection.length > 0 && (
                <div className="card" style={{ marginTop: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>📚 Recent Papers in Collection</h3>
                    <div className="paper-select-list">
                        {collection.slice(-5).reverse().map(paper => (
                            <div key={paper.paperId} className="paper-select-item">
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
            )}

            {collection.length === 0 && (
                <div className="empty-state" style={{ paddingTop: 40, paddingBottom: 40 }}>
                    <div className="empty-icon">🚀</div>
                    <h3>Get Started</h3>
                    <p>Search for papers and add them to your collection to unlock summaries, literature reviews, and gap analysis.</p>
                </div>
            )}
        </div>
    );
}
