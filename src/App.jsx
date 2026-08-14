import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import useLocalStorage from './hooks/useLocalStorage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import SummaryPage from './pages/SummaryPage';
import LiteratureReviewPage from './pages/LiteratureReviewPage';
import GapAnalysisPage from './pages/GapAnalysisPage';
import './App.css';

function App() {
  const [collection, setCollection] = useLocalStorage('researchai-collection', []);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
          // Navigate to search page if not already there
          if (!window.location.pathname.includes('/search')) {
            window.location.href = '/search';
          }
        } else {
          window.location.href = '/search';
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Close sidebar on route change (mobile)
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          {/* Mobile hamburger */}
          <button
            className={`hamburger-btn ${sidebarOpen ? 'open' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>

          {/* Backdrop for mobile */}
          {sidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar} />}

          <aside className={`sidebar ${sidebarOpen ? 'sidebar-mobile-open' : ''}`}>
            <div className="sidebar-brand">
              <div className="sidebar-brand-icon">🧠</div>
              <div className="sidebar-brand-text">
                <h1>ResearchAI</h1>
                <p>Academic Paper Assistant</p>
              </div>
            </div>

            <nav className="sidebar-nav">
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                <span className="nav-icon">🏠</span>
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                <span className="nav-icon">🔍</span>
                <span>Paper Search</span>
                <span className="kbd-hint">⌘K</span>
              </NavLink>

              <NavLink to="/summaries" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                <span className="nav-icon">📝</span>
                <span>Summaries</span>
              </NavLink>

              <NavLink to="/review" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                <span className="nav-icon">📖</span>
                <span>Lit. Review</span>
              </NavLink>

              <NavLink to="/gaps" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                <span className="nav-icon">🔬</span>
                <span>Gap Analysis</span>
              </NavLink>
            </nav>

            <div className="sidebar-footer">
              <div className="collection-count">
                <span>📚</span>
                <span>Papers Collected</span>
                <span className="count-number">{collection.length}</span>
              </div>
              <div className="sidebar-version">
                <span>v2.0 • Advanced</span>
              </div>
            </div>
          </aside>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<DashboardPage collection={collection} />} />
              <Route path="/search" element={<SearchPage collection={collection} setCollection={setCollection} />} />
              <Route path="/summaries" element={<SummaryPage collection={collection} />} />
              <Route path="/review" element={<LiteratureReviewPage collection={collection} />} />
              <Route path="/gaps" element={<GapAnalysisPage collection={collection} />} />
            </Routes>
          </main>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
