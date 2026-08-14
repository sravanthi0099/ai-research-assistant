import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import PaperCard from '../components/PaperCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PaperDetailModal from '../components/PaperDetailModal';
import { useToast } from '../components/Toast';

const API_BASE = '/api';

export default function SearchPage({ collection, setCollection }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [yearFilter, setYearFilter] = useState('');
    const [fieldFilter, setFieldFilter] = useState('');
    const [sortBy, setSortBy] = useState('relevance');
    const [openAccessOnly, setOpenAccessOnly] = useState(false);
    const [detailPaper, setDetailPaper] = useState(null);
    const limit = 10;
    const searchIdRef = useRef(0);
    const toast = useToast();

    const search = useCallback(async (newOffset = 0) => {
        if (!query.trim()) return;
        setLoading(true);
        setError('');
        const currentId = ++searchIdRef.current;
        try {
            const params = { query: query.trim(), offset: newOffset, limit };
            if (yearFilter) params.year = yearFilter;
            if (fieldFilter) params.fieldsOfStudy = fieldFilter;
            if (openAccessOnly) params.openAccess = 'true';
            const { data } = await axios.get(`${API_BASE}/search`, { params });

            // Race condition guard
            if (currentId !== searchIdRef.current) return;

            let papers = data.data || [];

            // Client-side sort
            if (sortBy === 'citations') {
                papers = [...papers].sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
            } else if (sortBy === 'year') {
                papers = [...papers].sort((a, b) => (b.year || 0) - (a.year || 0));
            }

            setResults(papers);
            setTotal(data.total || 0);
            setOffset(newOffset);
        } catch (err) {
            if (currentId !== searchIdRef.current) return;
            setError(err.response?.data?.error || 'Search failed. Make sure the backend server is running.');
            setResults([]);
        }
        setLoading(false);
    }, [query, yearFilter, fieldFilter, sortBy, openAccessOnly]);

    const handleSearch = (e) => {
        e.preventDefault();
        search(0);
    };

    const isInCollection = (paperId) => collection.some(p => p.paperId === paperId);

    const togglePaper = (paper) => {
        if (isInCollection(paper.paperId)) {
            setCollection(collection.filter(p => p.paperId !== paper.paperId));
            toast.info('Removed from collection');
        } else {
            setCollection([...collection, paper]);
            toast.success('Added to collection!');
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h1>🔍 Paper Search</h1>
                <p>Search millions of academic papers via Semantic Scholar</p>
            </div>

            <form onSubmit={handleSearch}>
                <div className="input-group">
                    <span className="search-icon">🔎</span>
                    <input
                        type="text"
                        id="search-input"
                        className="search-input"
                        placeholder="Search for papers... (e.g., 'transformer attention mechanism')"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="filters-bar">
                    <div className="filter-group">
                        <label>Year Range</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g., 2020-2024"
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            style={{ width: 150 }}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Field of Study</label>
                        <select
                            className="input-field"
                            value={fieldFilter}
                            onChange={(e) => setFieldFilter(e.target.value)}
                            style={{ width: 200 }}
                        >
                            <option value="">All Fields</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Medicine">Medicine</option>
                            <option value="Physics">Physics</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Biology">Biology</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Psychology">Psychology</option>
                            <option value="Economics">Economics</option>
                            <option value="Sociology">Sociology</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Sort By</label>
                        <select
                            className="input-field"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ width: 150 }}
                        >
                            <option value="relevance">Relevance</option>
                            <option value="citations">Most Cited</option>
                            <option value="year">Newest First</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Open Access</label>
                        <button
                            type="button"
                            className={`toggle-switch ${openAccessOnly ? 'active' : ''}`}
                            onClick={() => setOpenAccessOnly(!openAccessOnly)}
                            aria-label="Toggle open access filter"
                        >
                            <span className="toggle-knob" />
                        </button>
                    </div>

                    <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()}>
                            {loading ? '⏳ Searching...' : '🚀 Search'}
                        </button>
                    </div>
                </div>
            </form>

            {error && (
                <div className="error-alert">
                    ⚠️ {error}
                </div>
            )}

            {loading && <LoadingSkeleton count={4} />}

            {!loading && results.length === 0 && !error && (
                <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <h3>Search for academic papers</h3>
                    <p>Enter a topic, author, or keyword to discover research papers from across the academic world.</p>
                </div>
            )}

            {!loading && results.length > 0 && (
                <>
                    <p style={{ marginTop: 20, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Showing {offset + 1}–{Math.min(offset + limit, total)} of {total.toLocaleString()} results
                    </p>

                    <div className="results-grid stagger-children">
                        {results.map((paper) => (
                            <PaperCard
                                key={paper.paperId}
                                paper={paper}
                                isCollected={isInCollection(paper.paperId)}
                                onToggle={togglePaper}
                                onViewDetail={setDetailPaper}
                            />
                        ))}
                    </div>

                    <div className="pagination">
                        <button
                            className="btn btn-secondary btn-sm"
                            disabled={offset === 0}
                            onClick={() => search(Math.max(0, offset - limit))}
                        >
                            ← Previous
                        </button>
                        <span className="pagination-info">
                            Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
                        </span>
                        <button
                            className="btn btn-secondary btn-sm"
                            disabled={offset + limit >= total}
                            onClick={() => search(offset + limit)}
                        >
                            Next →
                        </button>
                    </div>
                </>
            )}

            {detailPaper && (
                <PaperDetailModal paper={detailPaper} onClose={() => setDetailPaper(null)} />
            )}
        </div>
    );
}
