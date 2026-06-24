import React, { useState, useEffect } from 'react';
import { 
  Database, 
  UploadCloud, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  ShieldCheck,
  ArrowRight,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Trash2,
  HelpCircle,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SystemStats } from '../types';

interface IntegrationConfigProps {
  stats: SystemStats;
  onRefreshStats: () => void;
  firebaseConnected: boolean;
  onSetFirebaseConnected: (conn: boolean) => void;
}

export default function IntegrationConfig({
  stats,
  onRefreshStats,
  firebaseConnected,
  onSetFirebaseConnected
}: IntegrationConfigProps) {
  // MongoDB state
  const [mongoUri, setMongoUri] = useState('mongodb://localhost:27017/idv-dashboard');
  const [mongoStatus, setMongoStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [mongoError, setMongoError] = useState('');

  // Firebase state
  const [firebaseApiKey, setFirebaseApiKey] = useState('AIzaSyD-mock-api-key-1kosmos');
  const [firebaseProjectId, setFirebaseProjectId] = useState('idv-success-matrix-firestore');

  // File import state
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  // New CSV / Excel and multi-client planning states
  const [clients, setClients] = useState<any[]>([]);
  const [parsedFileName, setParsedFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[] | null>(null);
  const [detectedClients, setDetectedClients] = useState<any[]>([]);
  const [fileMode, setFileMode] = useState<'single' | 'multi'>('single');
  const [selectedSingleClient, setSelectedSingleClient] = useState<string>('');
  const [clientMappings, setClientMappings] = useState<Record<string, string>>({});
  const [ingestionType, setIngestionType] = useState<'append' | 'replace'>('append');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch clients on mount for planning validation
  useEffect(() => {
    fetch('/api/clients')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) throw new Error("Response is not JSON");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setClients(data);
        }
      })
      .catch(err => console.warn("Error fetching clients in IntegrationConfig", err.message || err));
  }, []);

  // Fetch Mongo Status on load
  useEffect(() => {
    fetch('/api/mongodb/status')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) throw new Error("Response is not JSON");
        return res.json();
      })
      .then(data => {
        if (data && data.connected) {
          setMongoStatus('connected');
          setMongoUri(data.rawUri || mongoUri);
        } else {
          setMongoStatus('disconnected');
        }
      })
      .catch(err => console.warn("Error checking mongo status:", err.message || err));
  }, []);

  const handleMongoConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setMongoStatus('connecting');
    setMongoError('');
    
    try {
      const res = await fetch('/api/mongodb/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: mongoUri })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMongoStatus('connected');
        onRefreshStats();
      } else {
        setMongoStatus('error');
        setMongoError(data.error || 'Connection timed out or refuel failed.');
      }
    } catch (err) {
      setMongoStatus('error');
      setMongoError('Network failed connecting to MongoDB on port 3000 proxy.');
    }
  };

  const handleMongoDisconnect = async () => {
    try {
      await fetch('/api/mongodb/disconnect', { method: 'POST' });
      setMongoStatus('disconnected');
      onRefreshStats();
    } catch (err) {
      console.warn("MongoDB disconnect error:", err);
    }
  };

  // Helper to compute detected clients in file data
  const computeDetectedClients = (rows: any[], knownClients: any[]) => {
    const counts: Record<string, { id: string; name: string; count: number; matchedId: string | null }> = {};
    
    rows.forEach(row => {
      const rowKeys = Object.keys(row);
      const findVal = (possibleKeys: string[]) => {
        const matchedKey = rowKeys.find(k => {
          const normalized = k.toLowerCase().replace(/[\s_:-]/g, '');
          return possibleKeys.includes(normalized);
        });
        return matchedKey ? row[matchedKey] : undefined;
      };

      const cId = findVal(['clientid', 'cliid', 'clientcode', 'client_id', 'client'])?.toString().trim() || '';
      const cName = findVal(['clientname', 'client_name', 'companyname', 'company_name', 'company'])?.toString().trim() || '';

      const key = cId || cName || 'UNSPECIFIED';
      
      if (counts[key]) {
        counts[key].count += 1;
      } else {
        let matchedId: string | null = null;
        let matchedName = cName || cId || 'Unspecified Client';
        
        if (cId) {
          const matched = knownClients.find(c => c.id.toLowerCase() === cId.toLowerCase() || c.name.toLowerCase() === cId.toLowerCase());
          if (matched) {
            matchedId = matched.id;
            matchedName = matched.name;
          }
        } else if (cName) {
          const matched = knownClients.find(c => c.name.toLowerCase() === cName.toLowerCase() || c.id.toLowerCase() === cName.toLowerCase());
          if (matched) {
            matchedId = matched.id;
            matchedName = matched.name;
          }
        }
        
        counts[key] = {
          id: cId,
          name: matchedName,
          count: 1,
          matchedId
        };
      }
    });

    return Object.values(counts);
  };

  // Sample data download generators for Excel & CSV (Single and Multi-Client)
  const downloadTemplate = (format: 'xlsx' | 'csv', type: 'single' | 'multi') => {
    const headers = type === 'single'
      ? ["Timestamp", "User ID", "ID Type", "Status", "Failure Reason", "Response Time (ms)", "Session ID"]
      : ["Client ID", "Client Name", "Timestamp", "User ID", "ID Type", "Status", "Failure Reason", "Response Time (ms)", "Session ID"];
    
    const sampleRows = type === 'single'
      ? [
          ["2026-06-24T08:00:00.000Z", "usr_998122", "Passport", "success", "", 1200, "SESS-998122-XYZ"],
          ["2026-06-24T08:05:00.000Z", "usr_998123", "Drivers_License", "failed", "Unclear document image", 1500, "SESS-998123-ABC"]
        ]
      : [
          ["CLI-001", "Apex Global Bank", "2026-06-24T08:00:00.000Z", "usr_998122", "Passport", "success", "", 1200, "SESS-001-XYZ"],
          ["CLI-003", "Kraken Futures", "2026-06-24T08:05:00.000Z", "usr_998123", "Drivers_License", "failed", "Fuzzy biometric scan", 1800, "SESS-003-ABC"]
        ];

    const ws_data = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SLA Logs Template");
    
    if (format === 'xlsx') {
      XLSX.writeFile(wb, `SLA_Ingestion_Template_${type}.xlsx`);
    } else {
      XLSX.writeFile(wb, `SLA_Ingestion_Template_${type}.csv`, { bookType: 'csv' });
    }
  };

  // File drag & upload parser
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setUploadStatus('parsing');
    setUploadMessage('');
    const reader = new FileReader();
    
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCsv = file.name.endsWith('.csv');
    
    if (!isExcel && !isCsv) {
      setUploadStatus('error');
      setUploadMessage("Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.");
      return;
    }

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          throw new Error("File contains no data rows or is formatted incorrectly.");
        }

        // Set raw data and filename
        setParsedFileName(file.name);
        setParsedRows(jsonData);
        
        // Compute detected clients
        const detected = computeDetectedClients(jsonData, clients);
        setDetectedClients(detected);
        
        // Auto-detect mode
        const hasClientCols = jsonData.some(row => {
          const rowKeys = Object.keys(row).map(k => k.toLowerCase().replace(/[\s_:-]/g, ''));
          return rowKeys.some(k => ['clientid', 'client_id', 'client', 'clientname', 'client_name'].includes(k));
        });

        if (!hasClientCols || detected.length <= 1) {
          setFileMode('single');
          // If 1 detected client was found with a match, set it
          if (detected.length === 1 && detected[0].matchedId) {
            setSelectedSingleClient(detected[0].matchedId);
          } else if (clients.length > 0) {
            setSelectedSingleClient(clients[0].id);
          }
        } else {
          setFileMode('multi');
          // Initialize automatic mappings for detected clients that are recognized
          const initialMappings: Record<string, string> = {};
          detected.forEach(d => {
            if (d.matchedId) {
              initialMappings[d.id || d.name] = d.matchedId;
            } else if (clients.length > 0) {
              // Try substring matching
              const term = (d.id || d.name || '').toLowerCase();
              const possibleMatch = clients.find(c => c.name.toLowerCase().includes(term) || term.includes(c.name.toLowerCase()));
              if (possibleMatch) {
                initialMappings[d.id || d.name] = possibleMatch.id;
              } else {
                initialMappings[d.id || d.name] = clients[0].id; // fallback
              }
            }
          });
          setClientMappings(initialMappings);
        }

        setUploadStatus('idle');
      } catch (err) {
        setUploadStatus('error');
        setUploadMessage(`Error parsing file: ${(err as Error).message}`);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleExecuteIngestion = async () => {
    if (!parsedRows) return;
    
    setUploadStatus('parsing');
    setUploadMessage('Sanitizing, parsing and packing logs to system specifications...');

    try {
      // Map all parsed rows into standardized VerificationLog items
      const mappedLogs = parsedRows.map((row, idx) => {
        const rowKeys = Object.keys(row);
        const findVal = (possibleKeys: string[]) => {
          const matchedKey = rowKeys.find(k => {
            const normalized = k.toLowerCase().replace(/[\s_:-]/g, '');
            return possibleKeys.includes(normalized);
          });
          return matchedKey ? row[matchedKey] : undefined;
        };

        const cId = findVal(['clientid', 'cliid', 'clientcode', 'client_id', 'client'])?.toString().trim() || '';
        const cName = findVal(['clientname', 'client_name', 'companyname', 'company_name', 'company'])?.toString().trim() || '';

        let finalClientId = "";
        let finalClientName = "";

        if (fileMode === 'single') {
          finalClientId = selectedSingleClient;
          finalClientName = clients.find(c => c.id === selectedSingleClient)?.name || "Apex Global Bank";
        } else {
          const fileKey = cId || cName || 'UNSPECIFIED';
          const mappedId = clientMappings[fileKey];
          if (mappedId) {
            finalClientId = mappedId;
            finalClientName = clients.find(c => c.id === mappedId)?.name || mappedId;
          } else {
            finalClientId = cId || "CLI-UNMAPPED";
            finalClientName = cName || cId || "Unmapped Client";
          }
        }

        // Parse status
        const rawStatus = (findVal(['status', 'state', 'verificationstatus', 'result']) || 'success').toString().toLowerCase();
        let status = 'success';
        if (['failed', 'fail', 'error', 'rejected'].some(word => rawStatus.includes(word))) {
          status = 'failed';
        } else if (['abandoned', 'abandon', 'not_performed', 'notperformed'].some(word => rawStatus.includes(word))) {
          status = 'abandoned';
        } else if (['retry', 'retried'].some(word => rawStatus.includes(word))) {
          status = 'retried';
        }

        const responseTimeRaw = findVal(['responsetimems', 'responsetime', 'latency', 'duration', 'ms']);
        const responseTimeMs = responseTimeRaw ? parseInt(responseTimeRaw.toString()) : (800 + Math.floor(Math.random() * 1500));

        const userId = (findVal(['userid', 'user_id', 'username', 'user', 'uid']) || `user_uploaded_${Math.floor(Math.random() * 100000)}`).toString();
        const idTypeRaw = (findVal(['idtype', 'id_type', 'type', 'id_document']) || 'Passport').toString();
        let idType: 'Passport' | 'Drivers_License' | 'National_ID' | 'Biometric' = 'Passport';
        if (idTypeRaw.toLowerCase().includes('driver')) idType = 'Drivers_License';
        else if (idTypeRaw.toLowerCase().includes('national') || idTypeRaw.toLowerCase().includes('id')) idType = 'National_ID';
        else if (idTypeRaw.toLowerCase().includes('bio') || idTypeRaw.toLowerCase().includes('face')) idType = 'Biometric';

        const timestampRaw = findVal(['timestamp', 'time', 'date', 'datetime', 'createdat', 'created_at']);
        const timestamp = timestampRaw ? new Date(timestampRaw.toString()).toISOString() : new Date().toISOString();

        const sessionId = (findVal(['sessionid', 'session_id', 'session', 'sessid']) || `SESS-UPL-${userId}-${Math.floor(Math.random() * 1000)}`).toString();
        const completedByRaw = findVal(['completedby', 'completed_by', 'completed']);
        const completedBy = completedByRaw ? new Date(completedByRaw.toString()).toISOString() : timestamp;

        const failureReason = findVal(['failurereason', 'failure_reason', 'reason', 'error', 'errormessage', 'message'])?.toString();

        return {
          id: (findVal(['id', 'logid', 'verificationid', 'key']) || `LOG-UPL-${Math.floor(100000 + Math.random() * 900000)}`).toString(),
          clientId: finalClientId,
          clientName: finalClientName,
          timestamp,
          userId,
          idType,
          status,
          failureReason: status === 'failed' ? (failureReason || 'Verification rejected') : undefined,
          responseTimeMs,
          sessionId,
          completedBy
        };
      });

      // Submit logs to API
      const res = await fetch('/api/upload-raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: mappedLogs, mode: ingestionType })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadStatus('success');
        setUploadMessage(`Successfully ingested ${mappedLogs.length} validation logs. System stats and SLA compliance rates recompiled.`);
        setParsedRows(null); // Clear active parsed state after success
        onRefreshStats();
      } else {
        setUploadStatus('error');
        setUploadMessage(data.error || 'Server rejected the parsed logs.');
      }
    } catch (err) {
      setUploadStatus('error');
      setUploadMessage(`Error during ingestion execution: ${(err as Error).message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="integration-config-layout">
      
      {/* 1. MongoDB Integration Card */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5" id="mongodb-config-panel">
        <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="h-4.5 w-4.5 text-emerald-550" />
          Real-time MongoDB Engine Integration
        </h3>
        <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
          Connect your production MongoDB cluster to ingest, aggregate and review live IDV verification transactions instead of using local memory stores.
        </p>

        {mongoStatus === 'connected' ? (
          <div className="mt-5 space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl text-xs flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <strong className="block font-semibold">MongoDB Session Active</strong>
                <span className="block mt-1 font-mono text-[10.5px] break-all">{mongoUri}</span>
                <span className="block mt-2 text-slate-500">Transactions are continuously evaluated, and metrics are written directly to your Firestore database.</span>
              </div>
            </div>

            <button
              onClick={handleMongoDisconnect}
              className="w-full bg-slate-50 hover:bg-slate-100 text-rose-600 border border-slate-200 font-medium text-xs py-2.5 px-4 rounded-xl transition-all select-none cursor-pointer"
            >
              Disconnect MongoDB Client
            </button>
          </div>
        ) : (
          <form onSubmit={handleMongoConnect} className="mt-5 space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                MongoDB Connection URI
              </label>
              <input
                type="text"
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
                placeholder="mongodb://username:password@host:port/database"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {mongoStatus === 'error' && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{mongoError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={mongoStatus === 'connecting'}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center gap-2 select-none cursor-pointer"
            >
              {mongoStatus === 'connecting' ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Testing Host Handshake...
                </>
              ) : (
                <>
                  <Database className="h-3.5 w-3.5" />
                  Connect & Synchronize Data
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* 2. Drag & Drop Upload Raw Local Files Card */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5" id="local-raw-upload-panel">
        <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <UploadCloud className="h-4.5 w-4.5 text-indigo-500" />
          Ingest Raw Verification Logs
        </h3>
        
        {parsedRows === null ? (
          <>
            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
              Upload local raw verification logs in **Excel (.xlsx, .xls)** or **CSV (.csv)** formats. The engine will parse and extract validation attempts, auto-mapping columns dynamically.
            </p>

            {/* Drag Drop Area */}
            <div className="mt-4">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}
              >
                <UploadCloud className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-700 font-semibold">Drag & Drop Excel (.xlsx) or CSV (.csv)</p>
                <p className="text-[10px] text-slate-500 mt-1">or click below to browse local system files</p>
                
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload-input"
                />
                <label
                  htmlFor="file-upload-input"
                  className="mt-3 inline-block bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-mono font-medium py-1.5 px-3 rounded-lg cursor-pointer select-none transition-colors"
                >
                  Browse Files
                </label>
              </div>
            </div>

            {/* Ingestion Templates Downloads */}
            <div className="mt-4 border-t border-slate-100 pt-4" id="template-downloads-panel">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold block mb-2.5">
                Download Verification Templates
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5 flex flex-col justify-between">
                  <span className="font-sans font-medium text-slate-700 text-[11px]">Single-Client Mode</span>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => downloadTemplate('xlsx', 'single')}
                      className="text-[10px] font-mono text-indigo-600 hover:text-indigo-500 flex items-center gap-1 cursor-pointer select-none"
                    >
                      <Download className="h-3 w-3" />
                      Excel (.xlsx)
                    </button>
                    <button
                      onClick={() => downloadTemplate('csv', 'single')}
                      className="text-[10px] font-mono text-indigo-600 hover:text-indigo-500 flex items-center gap-1 cursor-pointer select-none"
                    >
                      <Download className="h-3 w-3" />
                      CSV (.csv)
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5 flex flex-col justify-between">
                  <span className="font-sans font-medium text-slate-700 text-[11px]">Multi-Client Sheet</span>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => downloadTemplate('xlsx', 'multi')}
                      className="text-[10px] font-mono text-indigo-600 hover:text-indigo-500 flex items-center gap-1 cursor-pointer select-none"
                    >
                      <Download className="h-3 w-3" />
                      Excel (.xlsx)
                    </button>
                    <button
                      onClick={() => downloadTemplate('csv', 'multi')}
                      className="text-[10px] font-mono text-indigo-600 hover:text-indigo-500 flex items-center gap-1 cursor-pointer select-none"
                    >
                      <Download className="h-3 w-3" />
                      CSV (.csv)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Active Planning Console View */
          <div className="mt-3.5 space-y-4" id="ingestion-planner-console">
            {/* Header / Sub-banner info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-display font-semibold text-slate-800 text-xs">Active Ingestion Plan</h4>
                  <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[170px]" title={parsedFileName}>
                    {parsedFileName} ({parsedRows.length} rows)
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setParsedRows(null); setUploadStatus('idle'); setUploadMessage(''); }}
                className="text-[10.5px] text-rose-600 hover:text-rose-500 bg-rose-50 hover:bg-rose-100/60 px-2.5 py-1 rounded-lg transition-colors select-none font-medium font-sans cursor-pointer"
              >
                Clear File
              </button>
            </div>

            {/* Scope / Distribution selector */}
            <div className="space-y-1.5">
              <label className="block text-[10.5px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                Client Distribution Scope
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setFileMode('single')}
                  className={`py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all select-none cursor-pointer ${
                    fileMode === 'single'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/40 border border-transparent'
                  }`}
                >
                  Single Client
                </button>
                <button
                  type="button"
                  onClick={() => setFileMode('multi')}
                  className={`py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all select-none cursor-pointer ${
                    fileMode === 'multi'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/40 border border-transparent'
                  }`}
                >
                  Multi-Client Sheet
                </button>
              </div>
            </div>

            {/* Target Settings Box */}
            {fileMode === 'single' ? (
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 space-y-2">
                <label className="block text-[10.5px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                  Target System Client
                </label>
                <select
                  value={selectedSingleClient}
                  onChange={(e) => setSelectedSingleClient(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                  All {parsedRows.length} validation attempts will be parsed and resolved under this client's metrics.
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10.5px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                    Detected Client Map ({detectedClients.length})
                  </label>
                  <span className="bg-indigo-100 text-indigo-800 text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                    Verification Routing
                  </span>
                </div>
                
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {detectedClients.map((dc) => {
                    const fileKey = dc.id || dc.name;
                    const currentMap = clientMappings[fileKey] || '';
                    
                    return (
                      <div key={fileKey} className="flex flex-col gap-1.5 bg-white border border-slate-200 p-2.5 rounded-lg text-xs">
                        <div className="flex justify-between items-center min-w-0 gap-2">
                          <span className="font-semibold text-slate-700 truncate block" title={fileKey}>
                            "{fileKey}" <span className="text-[10px] text-slate-400 font-normal">({dc.count} rows)</span>
                          </span>
                          {dc.matchedId ? (
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-medium border border-emerald-100 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                              System Auto-Match
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 text-[9px] font-medium border border-amber-100 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                              Unmapped Name
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 border-t border-slate-50 pt-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">Route destination:</span>
                          <select
                            value={currentMap}
                            onChange={(e) => setClientMappings(prev => ({ ...prev, [fileKey]: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
                          >
                            {clients.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name} ({c.id})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inspect / Collapsible Data Preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setPreviewOpen(!previewOpen)}
                className="w-full bg-slate-50/80 hover:bg-slate-100/80 px-3 py-2 flex justify-between items-center text-xs font-semibold text-slate-700 select-none cursor-pointer border-b border-slate-200"
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  Inspect Ingestion Output Preview
                </span>
                {previewOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
              </button>
              
              {previewOpen && (
                <div className="overflow-x-auto text-[10.5px] font-mono max-h-36 p-1">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-left">
                        <th className="p-1.5 font-bold">Client Target</th>
                        <th className="p-1.5 font-bold font-mono">User Code</th>
                        <th className="p-1.5 font-bold">ID Type</th>
                        <th className="p-1.5 font-bold">Status</th>
                        <th className="p-1.5 font-bold text-right">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {parsedRows.slice(0, 3).map((row, idx) => {
                        const rowKeys = Object.keys(row);
                        const findVal = (possibleKeys: string[]) => {
                          const matchedKey = rowKeys.find(k => {
                            const normalized = k.toLowerCase().replace(/[\s_:-]/g, '');
                            return possibleKeys.includes(normalized);
                          });
                          return matchedKey ? row[matchedKey] : undefined;
                        };

                        const cId = findVal(['clientid', 'cliid', 'clientcode', 'client_id', 'client'])?.toString() || '';
                        const cName = findVal(['clientname', 'client_name', 'companyname', 'company_name', 'company'])?.toString() || '';
                        const uId = findVal(['userid', 'user_id', 'username', 'user', 'uid'])?.toString() || `usr_${idx}`;
                        const rawType = findVal(['idtype', 'id_type', 'type', 'id_document'])?.toString() || 'Passport';
                        const rawStat = (findVal(['status', 'state', 'verificationstatus', 'result']) || 'success').toString().toLowerCase();
                        const latency = findVal(['responsetimems', 'responsetime', 'latency', 'duration', 'ms'])?.toString() || '1200';

                        let targetClientLabel = "Apex Global Bank";
                        if (fileMode === 'single') {
                          targetClientLabel = clients.find(c => c.id === selectedSingleClient)?.name || "Apex Global Bank";
                        } else {
                          const fileKey = cId || cName || 'UNSPECIFIED';
                          const mappedId = clientMappings[fileKey];
                          targetClientLabel = clients.find(c => c.id === mappedId)?.name || fileKey;
                        }

                        let statusBadge = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                        if (['failed', 'fail', 'error', 'rejected'].some(word => rawStat.includes(word))) {
                          statusBadge = "bg-rose-50 text-rose-700 border border-rose-100";
                        } else if (['abandoned', 'abandon', 'not_performed', 'notperformed'].some(word => rawStat.includes(word))) {
                          statusBadge = "bg-amber-50 text-amber-700 border border-amber-100";
                        } else if (['retry', 'retried'].some(word => rawStat.includes(word))) {
                          statusBadge = "bg-indigo-50 text-indigo-700 border border-indigo-100";
                        }

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-1.5 truncate max-w-[90px] font-sans font-semibold text-slate-800">{targetClientLabel}</td>
                            <td className="p-1.5 truncate max-w-[60px]">{uId}</td>
                            <td className="p-1.5 truncate max-w-[70px]">{rawType}</td>
                            <td className="p-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${statusBadge}`}>
                                {rawStat.includes('fail') ? 'FAILED' : rawStat.includes('abandon') ? 'ABANDONED' : rawStat.includes('retry') ? 'RETRIED' : 'SUCCESS'}
                              </span>
                            </td>
                            <td className="p-1.5 text-right font-medium text-slate-950">{latency}ms</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="text-[9.5px] text-slate-400 text-center py-1 font-sans">
                    Showing {Math.min(3, parsedRows.length)} of {parsedRows.length} total file records
                  </p>
                </div>
              )}
            </div>

            {/* Ingestion Strategy / Action Mode */}
            <div className="space-y-1.5 bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <label className="block text-[10.5px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                SLA Aggregation Directive
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 font-semibold font-sans">
                  <input
                    type="radio"
                    name="ingestion-type"
                    value="append"
                    checked={ingestionType === 'append'}
                    onChange={() => setIngestionType('append')}
                    className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  <span>Append to current logs</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 font-semibold font-sans">
                  <input
                    type="radio"
                    name="ingestion-type"
                    value="replace"
                    checked={ingestionType === 'replace'}
                    onChange={() => setIngestionType('replace')}
                    className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  <span className="text-rose-600">Overwrite database logs</span>
                </label>
              </div>
            </div>

            {/* CTA Execution Button */}
            <button
              type="button"
              disabled={uploadStatus === 'parsing'}
              onClick={handleExecuteIngestion}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              {uploadStatus === 'parsing' ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Processing Ingestion Pipeline...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Compile & Import validation Data
                </>
              )}
            </button>
          </div>
        )}

        {/* Upload feedbacks */}
        {uploadStatus !== 'idle' && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
            uploadStatus === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
            uploadStatus === 'parsing' ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' :
            'bg-rose-50 border border-rose-100 text-rose-700'
          }`}>
            {uploadStatus === 'success' ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" /> :
             uploadStatus === 'parsing' ? <RefreshCw className="h-4 w-4 shrink-0 mt-0.5 animate-spin text-indigo-600" /> :
             <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />}
            <span>{uploadMessage || (uploadStatus === 'parsing' && 'Compiling dataset transaction package...')}</span>
          </div>
        )}
      </div>

      {/* 3. Firebase Client SDK Sync Indicator Card (Full Width Span) */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 md:col-span-2" id="firebase-sync-panel">
        <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="h-4.5 w-4.5 text-indigo-600" />
          Firebase Firestore Responsive Sync
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="md:col-span-2 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Firebase authentication credentials and Firestore schemas are initialized. Alert streams, dashboard layouts and SLA limits are written live to Firestore to enable multi-device collaboration.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 uppercase mb-1 font-semibold">Firestore Project ID</label>
                <input
                  type="text"
                  value={firebaseProjectId}
                  onChange={(e) => setFirebaseProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-500 uppercase mb-1 font-semibold">API Web Key</label>
                <input
                  type="password"
                  value={firebaseApiKey}
                  onChange={(e) => setFirebaseApiKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between items-center text-center">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Sync Engine</span>
              <div className={`text-sm font-semibold mt-1 ${firebaseConnected ? 'text-indigo-600 animate-pulse' : 'text-emerald-600'}`}>
                {firebaseConnected ? 'ACTIVE WEBSOCKET' : 'LOCAL CACHE SYNCED'}
              </div>
            </div>

            <button
              onClick={() => onSetFirebaseConnected(!firebaseConnected)}
              className={`mt-4 w-full border font-medium text-[11px] py-1.5 rounded-lg select-none transition-colors cursor-pointer ${
                firebaseConnected 
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-indigo-50 border-indigo-100 hover:border-indigo-200 text-indigo-700'
              }`}
            >
              {firebaseConnected ? 'Pause WebSocket' : 'Enable Real-time WebSockets'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
