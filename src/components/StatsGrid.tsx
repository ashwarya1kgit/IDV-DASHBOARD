import React, { useEffect, useRef } from 'react';
import { TrendingUp, AlertOctagon, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { SystemStats } from '../types';
import gsap from 'gsap';

interface StatsGridProps {
  stats: SystemStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [stats]);

  const cards = [
    {
      id: 'stat-success',
      title: 'Success Rate',
      value: `${stats.averageSuccessRate}%`,
      sub: 'Company wide average',
      color: 'from-emerald-500/20 to-teal-500/5',
      textColor: 'text-emerald-400',
      icon: CheckCircle2,
      progressColor: 'bg-emerald-500',
      progressVal: stats.averageSuccessRate,
      statusText: 'Within target SLA bounds (>85%)',
      statusColor: 'text-emerald-400'
    },
    {
      id: 'stat-failure',
      title: 'Failure Rate',
      value: `${stats.averageFailureRate}%`,
      sub: 'Technical failure rate',
      color: 'from-rose-500/20 to-pink-500/5',
      textColor: 'text-rose-400',
      icon: AlertOctagon,
      progressColor: 'bg-rose-500',
      progressVal: stats.averageFailureRate * 5, // scaled for 0-20% view
      statusText: 'Acceptable tech loss limit (<8%)',
      statusColor: 'text-slate-400'
    },
    {
      id: 'stat-abandonment',
      title: 'Abandonment Rate',
      value: `${stats.averageAbandonmentRate}%`,
      sub: 'User session exit rate',
      color: 'from-amber-500/20 to-orange-500/5',
      textColor: 'text-amber-400',
      icon: LogOut,
      progressColor: 'bg-amber-500',
      progressVal: stats.averageAbandonmentRate * 3.3, // scaled for 0-30% view
      statusText: 'Drop-off warning target (<15%)',
      statusColor: 'text-amber-400'
    },
    {
      id: 'stat-retry',
      title: 'Retry Rate',
      value: `${stats.averageRetryRate}%`,
      sub: 'Multi-attempt validations',
      color: 'from-indigo-500/20 to-blue-500/5',
      textColor: 'text-indigo-400',
      icon: RefreshCw,
      progressColor: 'bg-indigo-500',
      progressVal: stats.averageRetryRate * 4, // scaled for 0-25% view
      statusText: 'SLA standard rate (<12%)',
      statusColor: 'text-slate-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Transaction Volume vs Unique Session Resolution Banner */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 rounded-2xl p-5 md:p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden" id="deduplication-summary-banner">
        {/* Abstract background vector rings */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-indigo-500/30 text-indigo-300 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold border border-indigo-500/30">
                Data Resolution Engine
              </span>
              <span className="bg-emerald-500/30 text-emerald-300 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                SLA Compliance Mode
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight mt-1.5">
              Raw Transactions vs. Unique Sessions
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              To guarantee accurate SLA auditing, our engine analyzes raw logs while grouping validations by unique user sessions. Rates are calculated after resolving multi-step retries into single session outcomes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:shrink-0 w-full md:w-auto">
            {/* Metric 1: Raw Attempts without Deduplication */}
            <div className="bg-slate-900/50 border border-slate-800/80 px-5 py-3.5 rounded-xl min-w-[160px] flex-1 md:flex-initial">
              <div className="flex justify-between items-center text-slate-400 font-mono text-[9px] uppercase tracking-wider mb-1">
                <span>Raw Attempts</span>
                <span className="text-rose-400 font-bold text-[8px]">No Deduplication</span>
              </div>
              <div className="text-2xl md:text-3xl font-display font-black tracking-tight text-slate-100">
                {(stats.totalAttempts ?? 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1 leading-tight">
                All logs / transactions processed
              </div>
            </div>

            {/* Metric 2: Unique Sessions irrespective of final status */}
            <div className="bg-indigo-950/40 border border-indigo-500/30 px-5 py-3.5 rounded-xl min-w-[160px] flex-1 md:flex-initial relative">
              <div className="absolute top-0 right-0 -mt-1.5 -mr-1.5 bg-indigo-500 text-white text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-lg animate-pulse">
                Post-Deduplicated
              </div>
              <div className="flex justify-between items-center text-indigo-300 font-mono text-[9px] uppercase tracking-wider mb-1">
                <span>Unique Sessions</span>
                <span className="text-indigo-400 font-semibold text-[8px]">All States</span>
              </div>
              <div className="text-2xl md:text-3xl font-display font-black tracking-tight text-white">
                {(stats.totalSessions ?? 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-indigo-300/80 font-mono mt-1 leading-tight">
                All unique sessions irrespective of status
              </div>
            </div>

            {/* Metric 3: Dynamic Dataset Period */}
            <div className="bg-slate-900/50 border border-slate-800/80 px-5 py-3.5 rounded-xl min-w-[180px] flex-1 md:flex-initial">
              <div className="flex justify-between items-center text-slate-400 font-mono text-[9px] uppercase tracking-wider mb-1">
                <span>Dataset Period</span>
                <span className="text-emerald-400 font-bold text-[8px]">Dynamic Range</span>
              </div>
              <div className="text-sm font-display font-bold tracking-tight text-slate-100 flex items-center justify-center h-[36px]">
                {stats.startDate && stats.endDate ? (
                  <div className="flex flex-col text-center">
                    <span className="text-white text-xs md:text-sm font-semibold tracking-tight">
                      {new Date(stats.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-slate-500 font-mono text-[8px] uppercase tracking-wider">to</span>
                    <span className="text-white text-xs md:text-sm font-semibold tracking-tight">
                      {new Date(stats.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 font-normal italic text-[11px]">No Ingested Logs</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1 leading-tight">
                Active timeline of logs database
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" ref={containerRef} id="stats-grid-container">
        {cards.map((card) => {
          const Icon = card.icon;
          
          // Define theme status colors
          let statusTextColor = "text-slate-500";
          if (card.id === 'stat-success') statusTextColor = "text-emerald-600 font-semibold";
          if (card.id === 'stat-failure') statusTextColor = "text-rose-600 font-semibold";
          if (card.id === 'stat-abandonment') statusTextColor = "text-amber-600 font-semibold";
          if (card.id === 'stat-retry') statusTextColor = "text-indigo-600 font-semibold";

          // Define status color theme classes for main metric values
          let metricTextColor = "text-slate-900";
          if (card.id === 'stat-success') metricTextColor = "text-emerald-600";
          if (card.id === 'stat-failure') metricTextColor = "text-slate-900"; // keep it neutral as in template

          return (
            <div
              key={card.id}
              id={card.id}
              className="relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all duration-300 overflow-hidden shadow-sm group"
            >
              {/* Background Gradient Pulse (Softened for light theme) */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
                    {card.title}
                  </p>
                  <h3 className={`font-display font-bold text-3xl mt-1 tracking-tight ${metricTextColor}`}>
                    {card.value}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 mt-1 block">
                    {card.sub}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`h-5 w-5 ${card.id === 'stat-success' ? 'text-emerald-500' : card.id === 'stat-failure' ? 'text-rose-500' : card.id === 'stat-abandonment' ? 'text-amber-500' : 'text-indigo-500'}`} />
                </div>
              </div>

              {/* Custom mini progress bar */}
              <div className="mt-5">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/40">
                  <div
                    className={`h-full ${card.progressColor} rounded-full transition-all duration-1000`}
                    style={{ width: `${Math.min(100, Math.max(0, card.progressVal))}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2.5">
                  <span className="text-[10px] text-slate-400 font-mono">KPI Limits</span>
                  <span className={`text-[10px] font-mono ${statusTextColor}`}>
                    {card.statusText}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
