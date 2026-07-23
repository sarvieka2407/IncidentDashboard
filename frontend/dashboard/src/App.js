import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import LiveStatus from "./pages/LiveStatus";
import CompanyDetail from "./pages/CompanyDetail";
import "./App.css";

const API_URL = "http://localhost:8000";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      setLoading(true);
      setError(null);

      const [incidentsRes, companiesRes] = await Promise.all([
        axios.get(`${API_URL}/incidents`),
        axios.get(`${API_URL}/companies`),
      ]);

      setIncidents(incidentsRes.data.incidents);
      setCompanies(["All", ...companiesRes.data.companies]);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Could not connect to backend");
    } finally {
      setLoading(false);
    }
  }

  const handleNavigation = (page, company = null) => {
    setCurrentPage(page);
    if (company) setSelectedCompany(company);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await axios.get(`${API_URL}/refresh`);
      await fetchAllData();
    } catch {
      setError("Refresh failed");
      setLoading(false);
    }
  };

  const updateIncidentSummary = (incidentId, summary) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId ? { ...inc, ai_summary: summary } : inc
      )
    );
  };

  return (
    <div className="app">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigation} />

      <main className="main-content">
        {currentPage === "dashboard" && (
          <Dashboard
            incidents={incidents}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            onRefresh={handleRefresh}
            onCompanyClick={(company) => handleNavigation("detail", company)}
            onSummaryUpdate={updateIncidentSummary}
          />
        )}

        {currentPage === "status" && (
          <LiveStatus
            incidents={incidents}
            companies={companies}
            loading={loading}
            onCompanyClick={(company) => handleNavigation("detail", company)}
          />
        )}

        {currentPage === "detail" && selectedCompany && (
          <CompanyDetail
            company={selectedCompany}
            incidents={incidents.filter(i => i.company === selectedCompany)}
            onBack={() => handleNavigation("status")}
          />
        )}
      </main>
    </div>
  );
}

export default App;