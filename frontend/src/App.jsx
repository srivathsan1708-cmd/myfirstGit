import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context';
import { CompanyProvider } from './context/CompanyContext';
import Navbar        from './components/Navbar';
import Footer        from './components/Footer';
import Home          from './pages/Home';
import Dashboard     from './pages/Dashboard';
import Validator     from './pages/Validator';
import Leaderboard   from './pages/Leaderboard';
import CompanyPortal from './pages/CompanyPortal';

export default function App() {
  return (
    <Web3Provider>
      <CompanyProvider>
        <Router>
          <div className="app-shell">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/"               element={<Home />} />
                <Route path="/dashboard"      element={<Dashboard />} />
                <Route path="/validator"      element={<Validator />} />
                <Route path="/leaderboard"    element={<Leaderboard />} />
                <Route path="/company-portal" element={<CompanyPortal />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
              },
              success: { iconTheme: { primary: '#0284c7', secondary: '#ffffff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
            }}
          />
        </Router>
      </CompanyProvider>
    </Web3Provider>
  );
}