import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Radio, Mail, AlertTriangle, Clock } from 'lucide-react';
import { SystemStats } from '../types';

interface HeaderProps {
  stats: SystemStats;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  firebaseConnected: boolean;
}

export default function Header({ stats, activeTab, setActiveTab, firebaseConnected }: HeaderProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Company Overview', icon: ShieldCheck },
    { id: 'deepdive', label: 'Client Deep-Dive', icon: Radio },
    { id: 'reports', label: 'Email Reports & Alert Log', icon: Mail },
    { id: 'integration', label: 'Data & Cloud Integrations', icon: Database },
  ];

  return (
    <header className="border-b border-slate-250 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4" id="dashboard-header">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg tracking-tight text-slate-900 md:text-xl">
                1Kosmos IDV Success Hub
              </h1>
              <span className="bg-slate-100 text-[10px] text-slate-600 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                v1.2 SLA
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5">
              <p className="text-xs text-slate-500">
                Live Customer Success, SLA Compliance & Real-time Alert Matrix
              </p>
              {stats.startDate && stats.endDate && (
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  Period: {new Date(stats.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – {new Date(stats.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Real-Time Platform Status and Clock */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 font-mono text-xs text-slate-500">
          {/* Database Status Indicators */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${stats.mongoConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-[11px] font-semibold">Mongo</span>
            </div>
            <div className="h-3 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${firebaseConnected ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-[11px] font-semibold">Firebase</span>
            </div>
            <div className="h-3 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-700 font-semibold">{stats.dataSource}</span>
            </div>
          </div>

          {/* Clock */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-mono text-slate-700">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>{time || '00:00:00'}</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <nav className="flex items-center gap-2 mt-5 border-t border-slate-100 pt-4 overflow-x-auto max-w-7xl mx-auto scrollbar-none" id="tabs-navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shrink-0 select-none cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/10 scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.id === 'reports' && stats.activeAlertCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center animate-bounce">
                  {stats.activeAlertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
