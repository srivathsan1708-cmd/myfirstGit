import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [currentCompany, setCurrentCompany] = useState(() => {
    const saved = localStorage.getItem('provai_company');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('provai_token'));
  const [companyRequests, setCompanyRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const isCompanyLoggedIn = !!currentCompany;

  const fetchCompanyRequests = useCallback(async () => {
    try {
      const url = currentCompany
        ? `http://localhost:4000/api/company/requests?companyId=${currentCompany.id}`
        : 'http://localhost:4000/api/company/requests';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setCompanyRequests(data.requests || []);
      }
    } catch (e) {
      console.warn('Fetch company requests error:', e);
    }
  }, [currentCompany]);

  useEffect(() => {
    fetchCompanyRequests();
  }, [fetchCompanyRequests]);

  const loginCompany = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/company/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setCurrentCompany(data.company);
      setToken(data.token);
      localStorage.setItem('provai_company', JSON.stringify(data.company));
      localStorage.setItem('provai_token', data.token);

      toast.success(`Welcome back, ${data.company.name}! 🏢`);
      await fetchCompanyRequests();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerCompany = async (companyData) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/company/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setCurrentCompany(data.company);
      setToken(data.token);
      localStorage.setItem('provai_company', JSON.stringify(data.company));
      localStorage.setItem('provai_token', data.token);

      toast.success(`Registered ${data.company.name} successfully! 🎉`);
      await fetchCompanyRequests();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logoutCompany = () => {
    setCurrentCompany(null);
    setToken(null);
    localStorage.removeItem('provai_company');
    localStorage.removeItem('provai_token');
    toast.success('Logged out from Enterprise Portal');
  };

  const createRequest = async (requestData) => {
    setLoading(true);
    const loadingToast = toast.loading('Validating query parameter with AI Oracle Engine...');
    try {
      const payload = {
        ...requestData,
        companyId: currentCompany ? currentCompany.id : 'comp_custom',
        companyName: currentCompany ? currentCompany.name : 'Custom Enterprise Partner',
      };

      const res = await fetch('http://localhost:4000/api/company/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');

      toast.success('Valid Query Verified & Enterprise Request Created! 📡', { id: loadingToast });
      await fetchCompanyRequests();
      return data.request;
    } catch (err) {
      toast.error(`❌ Validation Error: ${err.message}`, { id: loadingToast, duration: 5000 });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status, confidence, finalValue) => {
    try {
      const res = await fetch(`http://localhost:4000/api/company/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, confidence, finalValue }),
      });
      if (res.ok) {
        await fetchCompanyRequests();
      }
    } catch (e) {
      console.warn('Update request status error:', e);
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        currentCompany,
        token,
        isCompanyLoggedIn,
        companyRequests,
        loading,
        loginCompany,
        registerCompany,
        logoutCompany,
        createRequest,
        updateRequestStatus,
        fetchCompanyRequests,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
