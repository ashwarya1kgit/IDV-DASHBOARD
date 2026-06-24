import React, { useState } from 'react';
import { Client, ClientMetrics } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';
import { Search, ArrowUpDown, ShieldAlert, CheckCircle2, ChevronRight, BarChart3, HelpCircle } from 'lucide-react';

interface CompanyViewProps {
  clients: Client[];
  metrics: ClientMetrics[];
  dailyTrends: any[];
  onSelectClient: (clientId: string) => void;
}

export default function CompanyView({ clients, metrics, dailyTrends, onSelectClient }: CompanyViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [sortField, setSortField] = useState<'name' | 'successRate' | 'totalAttempts' | 'totalSessions' | 'averageResponseTime'>('successRate');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter & Search
  const filteredMetrics = metrics.filter(m => {
    const client = clients.find(c => c.id === m.clientId);
    const matchesSearch = m.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || m.clientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === 'All' || client?.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  // Sort
  const sortedMetrics = [...filteredMetrics].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (sortField === 'name') {
      valA = a.clientName;
      valB = b.clientName;
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Industries available for filter
  const industries = ['All', 'Fintech', 'Healthcare', 'Crypto', 'E-Commerce', 'Gaming', 'SaaS'];

  // Prepare Chart Data for client success rates
  const successChartData = metrics.slice(0, 10).map(m => ({
    name: m.clientName.substring(0, 12) + '..',
    Success: m.successRate,
    Failure: m.failureRate,
    Abandonment: m.abandonmentRate,
    Retry: m.retryRate,
    id: m.clientId
  }));

  return (
    <div className="space-y-6" id="company-view-root">
      
      {/* 1. Visual Charts Row (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-grid-row">
        {/* Success Rates Bar Chart */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              SLA Comparison - Top 10 IDV Clients (%)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Sorted by Total Vol</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={successChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} domain={[40, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="Success" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Failure" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Retry" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Timeline Area Chart */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Company wide Volume & Success Rate Trends
            </h3>
            <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-md uppercase">Live Feed</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis yAxisId="left" stroke="#10b981" fontSize={10} tickLine={false} domain={[70, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area yAxisId="left" type="monotone" dataKey="successRate" stroke="#10b981" fillOpacity={1} fill="url(#colorSuccess)" name="Avg Success Rate (%)" />
                <Area yAxisId="right" type="monotone" dataKey="volume" stroke="#6366f1" fillOpacity={1} fill="url(#colorVolume)" name="Transaction Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. Controls & List Matrix */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5" id="company-table-container">
        
        {/* Controls Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-base">IDV Client Performance SLA Matrix</h3>
            <p className="text-xs text-slate-500 mt-1">Live aggregated monitoring status across all active verification clients.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 min-w-[200px]"
              />
            </div>

            {/* Industry Filter */}
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
            >
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind === 'All' ? 'All Industries' : ind}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] text-slate-500 uppercase tracking-wider font-mono">
                <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">
                    Client Name
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => handleSort('totalAttempts')}>
                  <div className="flex items-center gap-1.5">
                    Attempts Vol (Raw)
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => handleSort('totalSessions')}>
                  <div className="flex items-center gap-1.5" title="Total unique sessions deduplicated by sessionId (irrespective of status)">
                    Unique Sessions
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => handleSort('successRate')}>
                  <div className="flex items-center gap-1.5">
                    Success Rate
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-slate-550">Failure Rate</th>
                <th className="py-3 px-4 text-slate-550">Abandon Rate</th>
                <th className="py-3 px-4 text-slate-550">Retry Rate</th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => handleSort('averageResponseTime')}>
                  <div className="flex items-center gap-1.5">
                    Avg Latency
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center text-slate-550">SLA Compliance</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sortedMetrics.map((m) => {
                const client = clients.find(c => c.id === m.clientId);
                if (!client) return null;
                
                const hasViolation = m.violations.successRate || m.violations.failureRate || m.violations.abandonmentRate || m.violations.retryRate;

                return (
                  <tr
                    key={m.clientId}
                    className="hover:bg-slate-50/70 transition-all cursor-pointer group"
                    onClick={() => onSelectClient(m.clientId)}
                  >
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0"
                          style={{ backgroundColor: client.avatarColor }}
                        >
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {client.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {client.id} • {client.industry}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Attempts Volume */}
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {m.totalAttempts.toLocaleString()}
                    </td>

                    {/* Unique Sessions */}
                    <td className="py-3 px-4 font-mono text-indigo-600 font-semibold bg-indigo-50/20">
                      {(m.totalSessions ?? m.totalAttempts).toLocaleString()}
                    </td>

                    {/* Success Rate */}
                    <td className="py-3 px-4">
                      <span className={`font-mono font-semibold ${m.violations.successRate ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {m.successRate}%
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">SLA: &gt;={client.thresholds.minSuccessRate}%</span>
                    </td>

                    {/* Failure Rate */}
                    <td className="py-3 px-4">
                      <span className={`font-mono ${m.violations.failureRate ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
                        {m.failureRate}%
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">SLA: &lt;={client.thresholds.maxFailureRate}%</span>
                    </td>

                    {/* Abandonment Rate */}
                    <td className="py-3 px-4">
                      <span className={`font-mono ${m.violations.abandonmentRate ? 'text-amber-600 font-semibold' : 'text-slate-600'}`}>
                        {m.abandonmentRate}%
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">SLA: &lt;={client.thresholds.maxAbandonmentRate}%</span>
                    </td>

                    {/* Retry Rate */}
                    <td className="py-3 px-4">
                      <span className={`font-mono ${m.violations.retryRate ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}>
                        {m.retryRate}%
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">SLA: &lt;={client.thresholds.maxRetryRate}%</span>
                    </td>

                    {/* Average Response Time */}
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {(m.averageResponseTime / 1000).toFixed(2)}s
                    </td>

                    {/* Compliance Indicator */}
                    <td className="py-3 px-4 text-center">
                      {hasViolation ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                          <ShieldAlert className="h-3 w-3" />
                          Breached
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                          <CheckCircle2 className="h-3 w-3" />
                          Compliant
                        </span>
                      )}
                    </td>

                    {/* Arrow CTA */}
                    <td className="py-3 px-4 text-right">
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                    </td>
                  </tr>
                );
              })}
              
              {filteredMetrics.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500 text-xs">
                    No IDV clients found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
