/**
 * Reusable stats row component used across Summary, Review, and Gap Analysis pages.
 */
export default function StatRow({ stats }) {
    return (
        <div className="stats-row">
            {stats.map((stat, i) => (
                <div key={i} className="stat-card">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                </div>
            ))}
        </div>
    );
}
