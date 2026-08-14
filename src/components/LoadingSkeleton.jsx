/**
 * Animated loading skeleton for paper search results.
 */
export default function LoadingSkeleton({ count = 4 }) {
    return (
        <div className="skeleton-grid">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-card">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-meta">
                        <div className="skeleton-line skeleton-short" />
                        <div className="skeleton-line skeleton-short" />
                        <div className="skeleton-line skeleton-short" />
                    </div>
                    <div className="skeleton-line skeleton-text" />
                    <div className="skeleton-line skeleton-text" style={{ width: '80%' }} />
                    <div className="skeleton-line skeleton-text" style={{ width: '60%' }} />
                    <div className="skeleton-tags">
                        <div className="skeleton-line skeleton-tag" />
                        <div className="skeleton-line skeleton-tag" />
                    </div>
                </div>
            ))}
        </div>
    );
}
