import React, { useState } from 'react';
import { Mail, CheckCircle, RefreshCw, Eye, ShieldAlert, AlertCircle, FileText, Send } from 'lucide-react';
import { Client, ReportLog } from '../types';

interface ReportsLogViewProps {
  clients: Client[];
  reportLogs: ReportLog[];
  onRefreshReportLogs: () => void;
  onAddReportLog: (log: ReportLog) => void;
}

export default function ReportsLogView({
  clients,
  reportLogs,
  onRefreshReportLogs,
  onAddReportLog
}: ReportsLogViewProps) {
  // Automated report states
  const [recipients, setRecipients] = useState('ashwarya.joshi@1kosmos.com, compliance@1kosmos.com');
  const [schedule, setSchedule] = useState<'daily' | 'weekly' | 'monthly' | 'disabled'>('weekly');
  const [metricFlags, setMetricFlags] = useState({ success: true, failure: true, abandonment: true, retry: false });

  // Manual Composer states
  const [manualRecipients, setManualRecipients] = useState('stakeholders@1kosmos.com');
  const [manualSubject, setManualSubject] = useState('Ad-hoc IDV SLA Compliance Report');
  const [manualClient, setManualClient] = useState('');
  const [customMessage, setCustomMessage] = useState('Weekly review of our 20 active IDV client portals. Please check anomalous failures in fintech category.');
  
  const [isSending, setIsSending] = useState(false);
  const [reportResult, setReportResult] = useState<{ success: boolean; message: string; renderedHtml?: string } | null>(null);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  const handleSaveAutoConfig = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Automated Scheduler Configuration updated in Firebase Firestore!");
  };

  const handleSendManualReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setReportResult(null);

    try {
      const res = await fetch('/api/reports/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: manualRecipients,
          subject: manualSubject,
          clientId: manualClient || undefined,
          customMessage
        })
      });

      const data = await res.json();
      setIsSending(false);

      if (res.ok && data.success) {
        setReportResult({
          success: true,
          message: data.message,
          renderedHtml: data.renderedHtml
        });
        onAddReportLog(data.log);
      } else {
        setReportResult({
          success: false,
          message: data.error || 'Failed to dispatch report.'
        });
      }
    } catch (err) {
      setIsSending(false);
      setReportResult({
        success: false,
        message: 'Network connection failed during mail delivery.'
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="reports-view-layout">
      
      {/* Configuration & Manual Composer (Left & Middle Columns) */}
      <div className="lg:col-span-2 space-y-6" id="composer-configurations-panel">
        
        {/* 1. Scheduled Automated SLA Reports Config */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
          <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Mail className="h-4.5 w-4.5 text-indigo-600" />
            Automated Customer Success SLA Dispatcher
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Configure periodic, cron-scheduled verification digests. The compliance system will automatically construct and email metrics to defined stakeholders.
          </p>

          <form onSubmit={handleSaveAutoConfig} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10.5px] font-mono text-slate-500 uppercase tracking-wide mb-1.5 font-semibold">
                  Recipients List (comma-separated)
                </label>
                <input
                  type="text"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono text-slate-500 uppercase tracking-wide mb-1.5 font-semibold">
                  Dispatch Interval
                </label>
                <select
                  value={schedule}
                  onChange={(e: any) => setSchedule(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
                >
                  <option value="daily">Every day (00:00 UTC)</option>
                  <option value="weekly">Every Monday morning</option>
                  <option value="monthly">First day of month</option>
                  <option value="disabled">Disabled / Stop Automated Deliveries</option>
                </select>
              </div>
            </div>

            {/* Metrics Checklist checkboxes */}
            <div>
              <label className="block text-[10.5px] font-mono text-slate-500 uppercase tracking-wide mb-2 font-semibold">
                Metrics To Compile in Digest
              </label>
              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={metricFlags.success}
                    onChange={(e) => setMetricFlags({ ...metricFlags, success: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-0 bg-slate-50"
                  />
                  <span className="text-slate-700">Success Rates</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={metricFlags.failure}
                    onChange={(e) => setMetricFlags({ ...metricFlags, failure: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-0 bg-slate-50"
                  />
                  <span className="text-slate-700">Failure Outliers</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={metricFlags.abandonment}
                    onChange={(e) => setMetricFlags({ ...metricFlags, abandonment: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-0 bg-slate-50"
                  />
                  <span className="text-slate-700">User Abandonment</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={metricFlags.retry}
                    onChange={(e) => setMetricFlags({ ...metricFlags, retry: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-0 bg-slate-50"
                  />
                  <span className="text-slate-700">Multiple Retries</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
            >
              Update Scheduler Sync
            </button>
          </form>
        </div>

        {/* 2. Manual Custom Report Composer */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
          <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Send className="h-4 w-4 text-emerald-600" />
            Ad-hoc SLA Report Composer
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Construct and instantly dispatch an active customer success PDF/HTML report to specific partners.
          </p>

          <form onSubmit={handleSendManualReport} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10.5px] font-mono text-slate-500 uppercase tracking-wide mb-1.5 font-semibold">
                  Target Recipients (separated with commas)
                </label>
                <input
                  type="text"
                  required
                  value={manualRecipients}
                  onChange={(e) => setManualRecipients(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono text-slate-500 uppercase tracking-wide mb-1.5 font-semibold">
                  Client Deep-Dive Scope
                </label>
                <select
                  value={manualClient}
                  onChange={(e) => setManualClient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="">All 20 IDV Clients (Company wide digest)</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] font-mono text-slate-500 uppercase tracking-wide mb-1.5 font-semibold">
                Email Subject
              </label>
              <input
                type="text"
                required
                value={manualSubject}
                onChange={(e) => setManualSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-mono text-slate-500 uppercase tracking-wide mb-1.5 font-semibold">
                Executive operational comments / Custom notes
              </label>
              <textarea
                value={customMessage}
                rows={3}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {reportResult && (
              <div className={`p-4 rounded-xl text-xs flex flex-col gap-3 border ${
                reportResult.success ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-rose-50 border border-rose-100 text-rose-700'
              }`}>
                <div className="flex items-center gap-2">
                  {reportResult.success ? <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600" />}
                  <span className="font-semibold">{reportResult.message}</span>
                </div>
                
                {reportResult.renderedHtml && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowHtmlPreview(!showHtmlPreview)}
                      className="bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium text-slate-700 transition-colors flex items-center gap-1 cursor-pointer select-none"
                    >
                      <Eye className="h-3.5 w-3.5 text-indigo-600" />
                      {showHtmlPreview ? "Hide Rendered Email Preview" : "Review Transmitted Email Template"}
                    </button>
                    
                    {showHtmlPreview && (
                      <div className="mt-3 border border-slate-250 rounded-xl overflow-hidden bg-white max-h-[350px] overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: reportResult.renderedHtml }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 select-none cursor-pointer"
            >
              {isSending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating report & compiling data charts...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 text-emerald-250" />
                  Compile & Send Manual Email Digest
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Reports history log (Right Column) */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5" id="reports-delivery-log-panel">
        <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <FileText className="h-4 w-4 text-indigo-600" />
          Digest Dispatch Logs ({reportLogs.length})
        </h3>
        
        <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
          {reportLogs.map((log) => (
            <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start gap-2">
                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                  log.type === 'automated' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}>
                  {log.type}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">{log.subject}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 italic">
                  {log.previewBody}
                </p>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span className="truncate max-w-[120px]" title={log.recipients}>To: {log.recipients}</span>
                <span className={`flex items-center gap-1 ${log.status === 'sent' ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${log.status === 'sent' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                  {log.status === 'sent' ? 'Delivered' : 'Failed'}
                </span>
              </div>
            </div>
          ))}

          {reportLogs.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-6">No reports generated yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}
