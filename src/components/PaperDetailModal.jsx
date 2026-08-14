import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = '/api';

/**
 * Paper detail modal showing full information, references, and citations.
 */
export default function PaperDetailModal({ paper, onClose }) {
    const [references, setReferences] = useState([]);
    const [citations, setCitations] = useState([]);
    const [activeTab, setActiveTab] = useState('abstract');
    const [loadingRefs, setLoadingRefs] = useState(false);
    const [loadingCites, setLoadingCites] = useState(false);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const loadReferences = useCallback(async () => {
        if (references.length > 0 || loadingRefs) return;
        setLoadingRefs(true);
        try {
            const { data } = await axios.get(`${API_BASE}/paper/${paper.paperId}/references`, {
                params: { limit: 10 }
            });
            setReferences(data.data || []);
        } catch { /* ignore */ }
        setLoadingRefs(false);
    }, [paper.paperId, references.length, loadingRefs]);

    const loadCitations = useCallback(async () => {
        if (citations.length > 0 || loadingCites) return;
        setLoadingCites(true);
        try {
            const { data } = await axios.get(`${API_BASE}/paper/${paper.paperId}/citations`, {
                params: { limit: 10 }
            });
            setCitations(data.data || []);
        } catch { /* ignore */ }
        setLoadingCites(false);
    }, [paper.paperId, citations.length, loadingCites]);

    useEffect(() => {
        if (activeTab === 'references') loadReferences();
        if (activeTab === 'citations') loadCitations();
    }, [activeTab, loadReferences, loadCitations]);

    const doiUrl = paper.externalIds?.DOI ? `https://doi.org/${paper.externalIds.DOI}` : null;
    const pdfUrl = paper.openAccessPdf?.url || null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-fadeInUp" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

                <div className="modal-header">
                    <h2>{paper.title}</h2>
                    <div className="card-meta" style={{ marginTop: 12 }}>
                        {paper.year && <span>📅 {paper.year}</span>}
                        {paper.venue && <span>📖 {paper.venue}</span>}
                        <span>📊 {paper.citationCount ?? 0} citations</span>
                        <span>📄 {paper.referenceCount ?? 0} references</span>
                    </div>
                    <div className="modal-authors">
                        {paper.authors?.map((a, i) => (
                            <span key={i} className="author-tag">{a.name}</span>
                        ))}
                    </div>
                    <div className="modal-links">
                        {doiUrl && (
                            <a href={doiUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                                🔗 DOI
                            </a>
                        )}
                        {pdfUrl && (
                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm">
                                📄 Open Access PDF
                            </a>
                        )}
                        {paper.paperId && (
                            <a href={`https://www.semanticscholar.org/paper/${paper.paperId}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                                🔍 Semantic Scholar
                            </a>
                        )}
                    </div>
                </div>

                <div className="tabs">
                    <button className={`tab ${activeTab === 'abstract' ? 'active' : ''}`} onClick={() => setActiveTab('abstract')}>
                        📝 Abstract
                    </button>
                    <button className={`tab ${activeTab === 'references' ? 'active' : ''}`} onClick={() => setActiveTab('references')}>
                        📚 References ({paper.referenceCount ?? 0})
                    </button>
                    <button className={`tab ${activeTab === 'citations' ? 'active' : ''}`} onClick={() => setActiveTab('citations')}>
                        📊 Citations ({paper.citationCount ?? 0})
                    </button>
                </div>

                <div className="modal-body">
                    {activeTab === 'abstract' && (
                        <div className="analysis-content">
                            <p>{paper.abstract || 'No abstract available.'}</p>
                            {paper.fieldsOfStudy?.length > 0 && (
                                <div style={{ marginTop: 20 }}>
                                    <h4 style={{ marginBottom: 8, fontSize: '0.9rem' }}>Fields of Study</h4>
                                    <div className="card-tags">
                                        {paper.fieldsOfStudy.map(f => (
                                            <span key={f} className="tag">{f}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {paper.publicationTypes?.length > 0 && (
                                <div style={{ marginTop: 16 }}>
                                    <h4 style={{ marginBottom: 8, fontSize: '0.9rem' }}>Publication Type</h4>
                                    <div className="card-tags">
                                        {paper.publicationTypes.map(t => (
                                            <span key={t} className="tag">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'references' && (
                        <div>
                            {loadingRefs && (
                                <div className="loading-container" style={{ padding: 30 }}>
                                    <div className="spinner" />
                                    <p className="loading-text">Loading references...</p>
                                </div>
                            )}
                            {!loadingRefs && references.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>
                                    No references available.
                                </p>
                            )}
                            {references.map((ref, i) => (
                                <div key={i} className="ref-item">
                                    <div className="ref-title">{ref.citedPaper?.title || 'Untitled'}</div>
                                    <div className="ref-meta">
                                        {ref.citedPaper?.year && <span>📅 {ref.citedPaper.year}</span>}
                                        <span>📊 {ref.citedPaper?.citationCount ?? 0} citations</span>
                                        {ref.citedPaper?.authors?.slice(0, 2).map(a => a.name).join(', ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'citations' && (
                        <div>
                            {loadingCites && (
                                <div className="loading-container" style={{ padding: 30 }}>
                                    <div className="spinner" />
                                    <p className="loading-text">Loading citations...</p>
                                </div>
                            )}
                            {!loadingCites && citations.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>
                                    No citations available.
                                </p>
                            )}
                            {citations.map((cite, i) => (
                                <div key={i} className="ref-item">
                                    <div className="ref-title">{cite.citingPaper?.title || 'Untitled'}</div>
                                    <div className="ref-meta">
                                        {cite.citingPaper?.year && <span>📅 {cite.citingPaper.year}</span>}
                                        <span>📊 {cite.citingPaper?.citationCount ?? 0} citations</span>
                                        {cite.citingPaper?.authors?.slice(0, 2).map(a => a.name).join(', ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
