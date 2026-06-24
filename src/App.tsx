import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header.tsx';
import StatsGrid from './components/StatsGrid.tsx';
import AlertsManager from './components/AlertsManager.tsx';
import CompanyView from './components/CompanyView.tsx';
import ClientDeepDive from './components/ClientDeepDive.tsx';
import IntegrationConfig from './components/IntegrationConfig.tsx';
import ReportsLogView from './components/ReportsLogView.tsx';
import { Client, ClientMetrics, Alert, ReportLog, SystemStats } from './types.ts';
import gsap from 'gsap';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [clients, setClients] = useState<Client[]>([]);
  const [metrics, setMetrics] = useState<ClientMetrics[]>([]);
  const [dailyTrends, setDailyTrends] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reportLogs, setReportLogs] = useState<ReportLog[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalAttempts: 0,
    totalSessions: 0,
    averageSuccessRate: 100,
    averageFailureRate: 0,
    averageAbandonmentRate: 0,
    averageRetryRate: 0,
    activeAlertCount: 0,
    mongoConnected: false,
    dataSource: 'Local DB'
  });

  const [selectedClientId, setSelectedClientId] = useState('');
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  const mainContentRef = useRef<HTMLDivElement>(null);

  // Fetch all live dashboard statistics & lists
  const fetchDashboardData = () => {
    const safeFetchJson = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      return res.json();
    };

    // Fetch Summary Statistics
    safeFetchJson('/api/summary-stats')
      .then(data => setStats(data))
      .catch(err => console.warn("Error fetching stats:", err.message || err));

    // Fetch Client List
    safeFetchJson('/api/clients')
      .then(data => {
        if (Array.isArray(data)) {
          setClients(data);
          if (data.length > 0 && !selectedClientId) {
            setSelectedClientId(data[0].id);
          }
        }
      })
      .catch(err => console.warn("Error fetching clients:", err.message || err));

    // Fetch Client Metrics
    safeFetchJson('/api/logs/metrics')
      .then(data => {
        if (Array.isArray(data)) {
          setMetrics(data);
        }
      })
      .catch(err => console.warn("Error fetching metrics:", err.message || err));

    // Fetch Global trends
    safeFetchJson('/api/logs/daily-trends?days=14')
      .then(data => {
        if (Array.isArray(data)) {
          setDailyTrends(data);
        }
      })
      .catch(err => console.warn("Error fetching trends:", err.message || err));

    // Fetch Alerts
    safeFetchJson('/api/alerts')
      .then(data => {
        if (Array.isArray(data)) {
          setAlerts(data);
        }
      })
      .catch(err => console.warn("Error fetching alerts:", err.message || err));

    // Fetch Reports History log
    safeFetchJson('/api/reports/logs')
      .then(data => {
        if (Array.isArray(data)) {
          setReportLogs(data);
        }
      })
      .catch(err => console.warn("Error fetching reports logs:", err.message || err));
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll data every 15 seconds to simulate real-time updates from MongoDB/Firebase
    const poll = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(poll);
  }, [selectedClientId]);

  // Handle Tab Switch Transitions with GSAP
  useEffect(() => {
    if (mainContentRef.current) {
      gsap.fromTo(
        mainContentRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  // Resolve Alert handler
  const handleResolveAlert = async (id: string, notes?: string) => {
    try {
      const res = await fetch('/api/alerts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes })
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.warn("Resolve alert failure:", err);
    }
  };

  // Clear Resolved alerts log handler
  const handleClearAllResolved = async () => {
    try {
      await fetch('/api/alerts/clear-resolved', { method: 'POST' });
      fetchDashboardData();
    } catch (err) {
      console.warn("Clear resolved failure:", err);
    }
  };

  // Trigger simulated SLA anomaly breach
  const handleTriggerSimulation = async (clientId: string, metric: string) => {
    try {
      const res = await fetch('/api/alerts/trigger-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, metric })
      });
      if (res.ok) {
        fetchDashboardData();
        // Shake animation effect on Stats grid when an alert is injected
        gsap.fromTo("#stats-grid-container", 
          { x: -8 },
          { x: 0, duration: 0.1, repeat: 5, yoyo: true, ease: 'power1.inOut' }
        );
      }
    } catch (err) {
      console.warn("Trigger simulation failure:", err);
    }
  };

  // Update SLA thresholds handler
  const handleUpdateThresholds = async (id: string, thresholds: any) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, thresholds })
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.warn("Update thresholds failure:", err);
    }
  };

  const handleSelectClientFromTable = (id: string) => {
    setSelectedClientId(id);
    setActiveTab('deepdive');
  };

  const handleAddReportLog = (newLog: ReportLog) => {
    setReportLogs(prev => [newLog, ...prev]);
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans" id="application-container">
      {/* Dynamic Navigation Header */}
      <Header
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        firebaseConnected={firebaseConnected}
      />

      {/* Main Panel Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6" ref={mainContentRef}>
        
        {/* Dynamic overall SLA health summary cards */}
        {activeTab === 'overview' && <StatsGrid stats={stats} />}

        {/* Tab Specific Content views */}
        <div id="tab-content-render-target">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Company Metrics Table and Recharts comparison graphs */}
              <CompanyView
                clients={clients}
                metrics={metrics}
                dailyTrends={dailyTrends}
                onSelectClient={handleSelectClientFromTable}
              />
              
              {/* Quick glance alerts panel */}
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="font-display font-bold text-slate-800 text-base mb-4 uppercase tracking-wide">Live SLA Threshold Deviations</h3>
                <AlertsManager
                  alerts={alerts}
                  clients={clients}
                  onResolve={handleResolveAlert}
                  onClearAll={handleClearAllResolved}
                  onTriggerSimulation={handleTriggerSimulation}
                />
              </div>
            </div>
          )}

          {activeTab === 'deepdive' && (
            <ClientDeepDive
              clients={clients}
              metrics={metrics}
              selectedClientId={selectedClientId}
              onSelectClient={setSelectedClientId}
              onUpdateThresholds={handleUpdateThresholds}
              stats={stats}
            />
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <ReportsLogView
                clients={clients}
                reportLogs={reportLogs}
                onRefreshReportLogs={fetchDashboardData}
                onAddReportLog={handleAddReportLog}
              />
              <div className="mt-6 border-t border-slate-200 pt-6">
                <AlertsManager
                  alerts={alerts}
                  clients={clients}
                  onResolve={handleResolveAlert}
                  onClearAll={handleClearAllResolved}
                  onTriggerSimulation={handleTriggerSimulation}
                />
              </div>
            </div>
          )}

          {activeTab === 'integration' && (
            <IntegrationConfig
              stats={stats}
              onRefreshStats={fetchDashboardData}
              firebaseConnected={firebaseConnected}
              onSetFirebaseConnected={setFirebaseConnected}
            />
          )}
        </div>
      </main>

      {/* Elegant minimalist footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 font-mono mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 1Kosmos BlockID Customer Success Suite. All Rights Reserved.</span>
          <span>SLA Target: 99.9% Up-time | Ingest Status: Compliant</span>
        </div>
      </footer>
    </div>
  );
}
