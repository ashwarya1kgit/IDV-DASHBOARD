import React, { useState, useEffect } from 'react';
import { Client, ClientMetrics, SystemStats } from '../types';
import StatsGrid from './StatsGrid';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Download, Save, ShieldAlert, Edit, Check, Eye, HelpCircle } from 'lucide-react';

interface ClientDeepDiveProps {
  clients: Client[];
  metrics: ClientMetrics[];
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  onUpdateThresholds: (id: string, thresholds: any) => void;
  stats: SystemStats;
}

export default function ClientDeepDive({
  clients,
  metrics,
  selectedClientId,
  onSelectClient,
  onUpdateThresholds,
  stats
}: ClientDeepDiveProps) {
  const [clientId, setClientId] = useState(selectedClientId || clients[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [successRateSLA, setSuccessRateSLA] = useState(90);
  const [failureRateSLA, setFailureRateSLA] = useState(5);
  const [abandonmentRateSLA, setAbandonmentRateSLA] = useState(10);
  const [retryRateSLA, setRetryRateSLA] = useState(15);
  const [localTrends, setLocalTrends] = useState<any[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const client = clients.find(c => c.id === clientId) || clients[0];
  const clientMetric = metrics.find(m => m.clientId === client.id);

  // Synchronize local state with selectedClientId prop from parent
  useEffect(() => {
    if (selectedClientId && selectedClientId !== clientId) {
      setClientId(selectedClientId);
    }
  }, [selectedClientId]);

  // Load client's historical trend data
  useEffect(() => {
    if (client) {
      setClientId(client.id);
      setSuccessRateSLA(client.thresholds.minSuccessRate);
      setFailureRateSLA(client.thresholds.maxFailureRate);
      setAbandonmentRateSLA(client.thresholds.maxAbandonmentRate);
      setRetryRateSLA(client.thresholds.maxRetryRate);

      // Fetch client trends
      fetch(`/api/logs/daily-trends?clientId=${client.id}&days=14`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) throw new Error("Response is not JSON");
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            setLocalTrends(data);
          }
        })
        .catch(err => console.warn("Error fetching client trends:", err.message || err));
    }
  }, [client]);

  // Handle client selection dropdown
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelectClient(e.target.value);
  };

  const handleSaveThresholds = () => {
    onUpdateThresholds(client.id, {
      minSuccessRate: successRateSLA,
      maxFailureRate: failureRateSLA,
      maxAbandonmentRate: abandonmentRateSLA,
      maxRetryRate: retryRateSLA
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    if (localTrends.length === 0) return;
    
    // Headers
    const headers = ['Date', 'Success Rate (%)', 'Failure Rate (%)', 'Abandonment Rate (%)', 'Retry Rate (%)', 'Transaction Volume'];
    const rows = localTrends.map(day => [
      day.date,
      day.successRate,
      day.failureRate,
      day.abandonmentRate,
      day.retryRate,
      day.volume
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SLA_Report_${client.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON Function
  const handleExportJSON = () => {
    const reportData = {
      clientInfo: {
        id: client.id,
        name: client.name,
        industry: client.industry,
        onboardingDate: client.onboardingDate,
        slaThresholds: client.thresholds
      },
      aggregatedMetrics: clientMetric,
      dailyTrends: localTrends,
      generatedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `SLA_Full_Digest_${client.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock document type distribution (Passport, Drivers License, National ID, Biometrics)
  const docData = [
    { name: 'Passport', value: 35, color: '#3b82f6' },
    { name: 'Drivers License', value: 42, color: '#10b981' },
    { name: 'National ID', value: 15, color: '#8b5cf6' },
    { name: 'Biometric Face', value: 8, color: '#ec4899' }
  ];

  // Failure reasons breakdown (mock but highly realistic for IDV flow)
  const failureReasons = [
    { name: 'Liveness Check Failure', count: 42, color: '#ef4444' },
    { name: 'Image Blur / Bad Lighting', count: 28, color: '#f59e0b' },
    { name: 'Document Expired', count: 18, color: '#3b82f6' },
    { name: 'Face mismatch on ID', count: 12, color: '#8b5cf6' }
  ];

  return (
    <div className="space-y-6" id="deep-dive-root">
      
      {/* Top Banner with Client Selector */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="deep-dive-header-bar">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-300 rounded-full text-[10px] font-semibold tracking-wider uppercase">SLA Diagnostics</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-400 font-mono">Live Session Logging</span>
          </div>
          <h2 className="font-display font-bold text-xl md:text-2xl text-white mt-1.5 tracking-tight flex items-center gap-2">
            {client.name} <span className="text-sm font-normal text-slate-400">({client.id})</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Industry: <strong className="text-white">{client.industry}</strong></span>
            <span className="hidden sm:inline h-3 w-px bg-slate-700"></span>
            <span>Onboarded: <strong className="text-white">{client.onboardingDate}</strong></span>
          </p>
        </div>
        
        <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label htmlFor="top-client-select" className="text-xs font-semibold text-slate-300 self-center hidden sm:block">
            Active Client Profile:
          </label>
          <div className="relative">
            <select
              id="top-client-select"
              value={clientId}
              onChange={handleClientChange}
              className="w-full md:w-72 bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 shadow-inner appearance-none pr-10 cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name} ({c.id})</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
              <svg className="fill-current h-4 w-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Metric Stats and Transactions vs. Unique Section */}
      <StatsGrid stats={stats} />

      {/* Client Selector & Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="client-selector-row">
        {/* Active Client Metadata Profile card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between" id="client-metadata-card">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Client Integration Profile</h3>
            <p className="text-xs text-slate-500 mt-1">Status of current verification channels and API channels.</p>
            
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50/80 border border-slate-100 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">SDK Version</span>
                <span className="font-semibold text-slate-700 mt-0.5 block font-mono">v4.12.2</span>
              </div>
              <div className="bg-slate-50/80 border border-slate-100 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Channel Code</span>
                <span className="font-semibold text-indigo-600 mt-0.5 block font-mono">API-SECURE</span>
              </div>
              <div className="bg-slate-50/80 border border-slate-100 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Primary Region</span>
                <span className="font-semibold text-slate-700 mt-0.5 block">North America</span>
              </div>
              <div className="bg-slate-50/80 border border-slate-100 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Billing Status</span>
                <span className="font-semibold text-emerald-600 mt-0.5 block">Active</span>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4 text-xs font-mono text-slate-500 space-y-1.5">
            <div className="flex justify-between">
              <span>Industry:</span>
              <strong className="text-slate-700">{client.industry}</strong>
            </div>
            <div className="flex justify-between">
              <span>Onboarded:</span>
              <strong className="text-slate-700">{client.onboardingDate}</strong>
            </div>
            <div className="flex justify-between">
              <span>Portfolio ID:</span>
              <strong className="text-slate-700">{client.id}</strong>
            </div>
          </div>
        </div>

        {/* Client Current SLA Status */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
          <h3 className="font-display font-semibold text-slate-800 text-sm">SLA Compliance Health</h3>
          <p className="text-xs text-slate-500 mt-1">Real-time indicators showing overall performance limits.</p>
          
          {clientMetric ? (
            <div className="grid grid-cols-2 gap-3 mt-4 text-center">
              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase block leading-none">Success Rate</span>
                <div className={`text-lg font-bold mt-1.5 ${clientMetric.violations.successRate ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {clientMetric.successRate}%
                </div>
                <span className="text-[8px] text-slate-400 font-mono mt-0.5 block">Limit: &gt;={client.thresholds.minSuccessRate}%</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase block leading-none">Tech Failures</span>
                <div className={`text-lg font-bold mt-1.5 ${clientMetric.violations.failureRate ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {clientMetric.failureRate}%
                </div>
                <span className="text-[8px] text-slate-400 font-mono mt-0.5 block">Limit: &lt;={client.thresholds.maxFailureRate}%</span>
              </div>
              


              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl" title="Total raw transaction verification attempts without deduplication">
                <span className="text-[10px] font-mono text-slate-500 uppercase block leading-none">Raw Attempts</span>
                <div className="text-lg font-bold mt-1.5 text-slate-700">
                  {clientMetric.totalAttempts.toLocaleString()}
                </div>
                <span className="text-[8px] text-rose-500 font-mono mt-0.5 block font-medium">No Deduplication</span>
              </div>
              <div className="bg-indigo-50/40 border border-indigo-100 p-2.5 rounded-xl" title="Deduplicated unique sessions irrespective of final status">
                <span className="text-[10px] font-mono text-indigo-600 font-semibold uppercase block leading-none">Unique Sessions</span>
                <div className="text-lg font-bold mt-1.5 text-indigo-700">
                  {clientMetric.totalSessions.toLocaleString()}
                </div>
                <span className="text-[8px] text-indigo-500 font-mono mt-0.5 block font-semibold">Post-Deduplication</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No metrics compiled for client.</p>
          )}

          <div className="mt-4 flex items-center gap-2">
            {clientMetric && (clientMetric.violations.successRate || clientMetric.violations.failureRate) ? (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 p-2 rounded-xl text-xs flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Client is currently breaching active SLA thresholds!</span>
              </div>
            ) : (
              <div className="w-full bg-green-50 border border-green-200 text-green-700 p-2 rounded-xl text-xs flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>Fully compliant across all verification vectors.</span>
              </div>
            )}
          </div>
        </div>

        {/* Defined Thresholds Editor */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display font-semibold text-slate-800 text-sm">SLA Bound Configurations</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-indigo-600 hover:text-indigo-500 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Edit className="h-3.5 w-3.5" />
                Configure
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveThresholds}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Save className="h-3 w-3" />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-xl">
              <span className="text-slate-500">Min Success Rate SLA</span>
              {isEditing ? (
                <input
                  type="number"
                  value={successRateSLA}
                  onChange={(e) => setSuccessRateSLA(parseInt(e.target.value))}
                  className="w-16 bg-white border border-slate-300 rounded text-center text-slate-800 px-1 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              ) : (
                <strong className="text-emerald-600 font-mono">{client.thresholds.minSuccessRate}%</strong>
              )}
            </div>

            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-xl">
              <span className="text-slate-500">Max Failure Rate SLA</span>
              {isEditing ? (
                <input
                  type="number"
                  value={failureRateSLA}
                  onChange={(e) => setFailureRateSLA(parseInt(e.target.value))}
                  className="w-16 bg-white border border-slate-300 rounded text-center text-slate-800 px-1 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              ) : (
                <strong className="text-rose-600 font-mono">{client.thresholds.maxFailureRate}%</strong>
              )}
            </div>

            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-xl">
              <span className="text-slate-500">Max Abandonment SLA</span>
              {isEditing ? (
                <input
                  type="number"
                  value={abandonmentRateSLA}
                  onChange={(e) => setAbandonmentRateSLA(parseInt(e.target.value))}
                  className="w-16 bg-white border border-slate-300 rounded text-center text-slate-800 px-1 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              ) : (
                <strong className="text-amber-600 font-mono">{client.thresholds.maxAbandonmentRate}%</strong>
              )}
            </div>

            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-xl">
              <span className="text-slate-500">Max Retry SLA</span>
              {isEditing ? (
                <input
                  type="number"
                  value={retryRateSLA}
                  onChange={(e) => setRetryRateSLA(parseInt(e.target.value))}
                  className="w-16 bg-white border border-slate-300 rounded text-center text-slate-800 px-1 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              ) : (
                <strong className="text-indigo-600 font-mono">{client.thresholds.maxRetryRate}%</strong>
              )}
            </div>
          </div>

          {saveSuccess && (
            <div className="absolute inset-x-0 bottom-0 bg-emerald-600 text-white text-center py-1 text-[11px] font-mono animate-fade-in flex items-center justify-center gap-1">
              <Check className="h-3.5 w-3.5" />
              Threshold Configuration Synced to Firebase!
            </div>
          )}
        </div>
      </div>

      {/* SLA Metrics Trends Line Chart */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5" id="metric-trends-linechart">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">14-Day SLA Compliance Trend Matrix</h3>
            <p className="text-xs text-slate-500 mt-1">Timeline analyzing verification Success vs failure & abandonment rates.</p>
          </div>
          
          {/* Data Export buttons */}
          <div className="flex gap-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 font-medium text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer select-none"
            >
              <Download className="h-3.5 w-3.5 text-indigo-600" />
              Export CSV Report
            </button>
            <button
              onClick={handleExportJSON}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 font-medium text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer select-none"
            >
              <Download className="h-3.5 w-3.5 text-teal-600" />
              Full JSON Digest
            </button>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={localTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} domain={[40, 100]} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={2.5} name="Success Rate (%)" dot={false} />
              <Line type="monotone" dataKey="failureRate" stroke="#ef4444" strokeWidth={1.5} name="Failure Rate (%)" dot={false} />
              <Line type="monotone" dataKey="abandonmentRate" stroke="#f59e0b" strokeWidth={1.5} name="Abandonment Rate (%)" dot={false} />
              <Line type="monotone" dataKey="retryRate" stroke="#6366f1" strokeWidth={1.5} name="Retry Rate (%)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ID Type Distribution & Failure Breakdown Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="distribution-row">
        {/* Verification ID type distribution */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
          <h3 className="font-display font-semibold text-slate-800 text-sm mb-4">Verification ID Document Volume Share</h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="h-44 w-44 shrink-0 mx-auto sm:mx-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={docData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {docData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5 w-full">
              {docData.map((d, idx) => (
                <div key={d.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-600">{d.name}</span>
                  </div>
                  <strong className="text-slate-800 font-mono">{d.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Failure breakdowns */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
          <h3 className="font-display font-semibold text-slate-800 text-sm mb-4">Technical Failure Breakdown (Top Anomalies)</h3>
          <div className="space-y-3.5">
            {failureReasons.map((reason) => (
              <div key={reason.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{reason.name}</span>
                  <span className="text-slate-500 font-mono font-semibold">{reason.count} incidents</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/40">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(reason.count / 100) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
