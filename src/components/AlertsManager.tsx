import React, { useState } from 'react';
import { Alert, Client } from '../types';
import { AlertTriangle, CheckCircle, Flame, Ban, Trash2, ShieldAlert } from 'lucide-react';

interface AlertsManagerProps {
  alerts: Alert[];
  clients: Client[];
  onResolve: (id: string, notes?: string) => void;
  onClearAll: () => void;
  onTriggerSimulation: (clientId: string, metric: string) => void;
}

export default function AlertsManager({ alerts, clients, onResolve, onClearAll, onTriggerSimulation }: AlertsManagerProps) {
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id || '');
  const [selectedMetric, setSelectedMetric] = useState('Success Rate');
  const [resolveNotes, setResolveNotes] = useState<{ [key: string]: string }>({});

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="alerts-manager-layout">
      {/* Simulation / Custom Triggers (Left Column) */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5" id="alert-simulation-panel">
        <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
          SLA Anomaly Simulator
        </h3>
        <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
          Manually simulate customer verification failures to test real-time visual alerts, threshold deviations, and email report delivery systems.
        </p>

        <div className="mt-4 space-y-4">
          {/* Client selector */}
          <div>
            <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
              Target IDV Client
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>
          </div>

          {/* Metric Selector */}
          <div>
            <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
              KPI to Breach
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Success Rate', 'Failure Rate', 'Abandonment Rate', 'Retry Rate'].map((metric) => (
                <button
                  key={metric}
                  type="button"
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-300 ${
                    selectedMetric === metric
                      ? 'bg-orange-50 border-orange-200 text-orange-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-550 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>

          {/* Trigger button */}
          <button
            type="button"
            onClick={() => onTriggerSimulation(selectedClient, selectedMetric)}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-orange-500/10 transition-all duration-300 flex items-center justify-center gap-2 mt-2"
          >
            <ShieldAlert className="h-4 w-4" />
            Inject Simulated Breach
          </button>
        </div>

        {/* Informative SLA limits */}
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Defined Threshold Standards
          </h4>
          <ul className="text-[11px] text-slate-500 space-y-1.5 mt-2 font-mono">
            <li>• Success Rate: Min 75% to 93% depending on tier</li>
            <li>• Technical Failures: Max 3% to 15% before critical alert</li>
            <li>• Abandonment: Max 5% to 25% based on product flow</li>
            <li>• Retries: Normal is &lt; 15%, warning above</li>
          </ul>
        </div>
      </div>

      {/* Active Alerts (Middle & Right Columns combined or dynamic) */}
      <div className="lg:col-span-2 space-y-6" id="active-alerts-panel">
        {/* Unresolved / Live alerts */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
              Live SLA Deviations & Alert Queue ({unresolvedAlerts.length})
            </h3>
            {resolvedAlerts.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] font-mono text-rose-600 hover:text-rose-700 flex items-center gap-1.5 transition-colors font-semibold"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Logs
              </button>
            )}
          </div>

          <div className="mt-4 space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            {unresolvedAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full mb-3 border border-emerald-100">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">System Fully Compliant</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  All 20 IDV clients are fully aligned with defined SLA threshold metrics. No anomalies detected.
                </p>
              </div>
            ) : (
              unresolvedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  id={alert.id}
                  className={`border rounded-xl p-4 transition-all duration-300 relative overflow-hidden ${
                    alert.severity === 'critical'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  {/* Alert severity indicator bar */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1 ${alert.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />

                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          alert.severity === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {alert.severity}
                        </span>
                        <h4 className="font-semibold text-sm text-slate-800">{alert.clientName}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{alert.clientId}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {alert.notes}
                      </p>
                      <div className="flex gap-4 mt-2 text-[11px] font-mono text-slate-500">
                        <span>Threshold: <strong className="text-slate-700">{alert.thresholdValue}%</strong></span>
                        <span>Actual: <strong className={alert.severity === 'critical' ? 'text-rose-600 font-bold' : 'text-amber-600 font-bold'}>{alert.actualValue}%</strong></span>
                        <span>Time: {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Acknowledge / Resolve controls */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Resolution comments..."
                        value={resolveNotes[alert.id] || ''}
                        onChange={(e) => setResolveNotes({ ...resolveNotes, [alert.id]: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-w-[150px]"
                      />
                      <button
                        onClick={() => {
                          onResolve(alert.id, resolveNotes[alert.id]);
                          setResolveNotes({ ...resolveNotes, [alert.id]: '' });
                        }}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs py-1 px-3 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer"
                      >
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        Resolve & Close
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resolved alerts history */}
        {resolvedAlerts.length > 0 && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
            <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Resolved & Archived Incidents ({resolvedAlerts.length})
            </h3>
            <div className="mt-4 space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
              {resolvedAlerts.map((alert) => (
                <div key={alert.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded uppercase font-bold">Resolved</span>
                      <strong className="text-slate-800">{alert.clientName}</strong>
                      <span className="text-slate-400 font-mono text-[10px]">{alert.metric}</span>
                    </div>
                    {alert.notes && (
                      <p className="text-slate-500 font-mono text-[10px] mt-1.5 italic">
                        Resolution Notes: {alert.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(alert.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
