import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import { INITIAL_CLIENTS, generateSyntheticLogs, generateAlertsFromLogs } from "./src/data.js";
import { Client, VerificationLog, Alert, ReportLog, ClientMetrics } from "./src/types.js";

const app = express();
const PORT = 3000;

// Parse JSON and URL encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-Memory Database State (re-initialized with high fidelity synthetic data)
let clients: Client[] = [...INITIAL_CLIENTS];
let logs: VerificationLog[] = generateSyntheticLogs(clients, 30);
let alerts: Alert[] = generateAlertsFromLogs(logs, clients);
let reportLogs: ReportLog[] = [
  {
    id: "REP-001",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    recipientCount: 2,
    recipients: "operations@1kosmos.com, compliance@1kosmos.com",
    status: "sent",
    type: "automated",
    subject: "IDV Weekly Customer Success Report - All Clients",
    previewBody: "Weekly report compiled. Overall Success Rate: 86.4%. Total Verifications: 3,420. Active Alert Count: 2."
  },
  {
    id: "REP-002",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    recipientCount: 1,
    recipients: "stakeholder@1kosmos.com",
    status: "sent",
    type: "manual",
    subject: "Ad-hoc Deep Dive: Apex Global Bank Anomaly",
    previewBody: "Custom stakeholder report for Apex Global Bank. Technical failure rate spiked to 8.5% due to document liveness matching errors."
  }
];

// MongoDB Configuration & Client
let mongoClient: MongoClient | null = null;
let mongoConnected = false;
let activeMongoUri = process.env.MONGODB_URI || "";

// Initialize MongoDB Connection if URI exists
async function connectToMongo(uri: string): Promise<boolean> {
  if (!uri) return false;
  try {
    if (mongoClient) {
      await mongoClient.close();
    }
    mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
    await mongoClient.connect();
    mongoConnected = true;
    activeMongoUri = uri;
    console.log("Successfully connected to MongoDB:", uri);
    return true;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    mongoConnected = false;
    return false;
  }
}

// Try auto-connecting on startup
if (activeMongoUri) {
  connectToMongo(activeMongoUri).catch(() => {});
}

// Calculate aggregated metrics for clients
function computeClientMetrics(clientLogs: VerificationLog[], client: Client): ClientMetrics {
  const clientSpecificLogs = clientLogs.filter(l => l.clientId === client.id);
  const total = clientSpecificLogs.length;
  
  if (total === 0) {
    return {
      clientId: client.id,
      clientName: client.name,
      industry: client.industry,
      totalAttempts: 0,
      totalSessions: 0,
      successCount: 0,
      failureCount: 0,
      abandonedCount: 0,
      retryCount: 0,
      successRate: 100,
      failureRate: 0,
      abandonmentRate: 0,
      retryRate: 0,
      averageResponseTime: 0,
      violations: { successRate: false, failureRate: false, abandonmentRate: false, retryRate: false }
    };
  }

  // Group by sessionId, get latest record by completedBy
  const sessionsMap = new Map<string, VerificationLog>();
  clientSpecificLogs.forEach(log => {
    const sId = log.sessionId || `SESS-FALLBACK-${log.id}`;
    const completedByVal = log.completedBy || log.timestamp;
    const existing = sessionsMap.get(sId);
    if (!existing) {
      sessionsMap.set(sId, log);
    } else {
      const existingCompletedByVal = existing.completedBy || existing.timestamp;
      if (new Date(completedByVal).getTime() > new Date(existingCompletedByVal).getTime()) {
        sessionsMap.set(sId, log);
      }
    }
  });
  const uniqueSessions = Array.from(sessionsMap.values());
  const totalSessions = uniqueSessions.length;

  const getNormalizedStatus = (status: string): 'SUCCESS' | 'FAILED' | 'NOT_PERFORMED' | 'OTHER' => {
    const s = (status || "").toUpperCase();
    if (s === 'SUCCESS' || s === 'RETRIED') return 'SUCCESS';
    if (s === 'FAILED') return 'FAILED';
    if (s === 'NOT_PERFORMED' || s === 'ABANDONED') return 'NOT_PERFORMED';
    return 'OTHER';
  };

  const successCount = uniqueSessions.filter(s => getNormalizedStatus(s.status) === 'SUCCESS').length;
  const failureCount = uniqueSessions.filter(s => getNormalizedStatus(s.status) === 'FAILED').length;
  const notPerformedCount = uniqueSessions.filter(s => getNormalizedStatus(s.status) === 'NOT_PERFORMED').length;
  const retryCount = clientSpecificLogs.filter(l => (l.status || "").toUpperCase() === 'RETRIED').length;
  const totalResponseTime = clientSpecificLogs.reduce((acc, curr) => acc + curr.responseTimeMs, 0);

  const successAndFailureCount = successCount + failureCount;
  const successRate = successAndFailureCount > 0 
    ? parseFloat(((successCount / successAndFailureCount) * 100).toFixed(1)) 
    : 100.0;
  const failureRate = successAndFailureCount > 0
    ? parseFloat(((failureCount / successAndFailureCount) * 100).toFixed(1))
    : 0.0;
  
  const countedCount = successCount + failureCount + notPerformedCount;
  const abandonmentRate = countedCount > 0
    ? parseFloat(((notPerformedCount / countedCount) * 100).toFixed(1))
    : 0.0;
  const retryRate = totalSessions > 0
    ? parseFloat(((retryCount / totalSessions) * 100).toFixed(1))
    : 0.0;
  const averageResponseTime = Math.round(totalResponseTime / total);

  const th = client.thresholds;
  
  return {
    clientId: client.id,
    clientName: client.name,
    industry: client.industry,
    totalAttempts: total,
    totalSessions,
    successCount,
    failureCount,
    abandonedCount: notPerformedCount,
    retryCount,
    successRate,
    failureRate,
    abandonmentRate,
    retryRate,
    averageResponseTime,
    violations: {
      successRate: successRate < th.minSuccessRate,
      failureRate: failureRate > th.maxFailureRate,
      abandonmentRate: abandonmentRate > th.maxAbandonmentRate,
      retryRate: retryRate > th.maxRetryRate
    }
  };
}

// Background Alert Verification loop (runs periodically in-app memory)
function runAlertsEngine() {
  const activeClients = clients.filter(c => c.status === 'active');
  const newAlerts: Alert[] = [];

  activeClients.forEach(client => {
    // Look at logs for the last 24 hours to generate live alerts
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const clientDayLogs = logs.filter(l => l.clientId === client.id && new Date(l.timestamp) >= oneDayAgo);
    
    if (clientDayLogs.length < 5) return; // ignore tiny samples for alerting

    const metrics = computeClientMetrics(clientDayLogs, client);
    const th = client.thresholds;

    if (metrics.violations.successRate) {
      // Check if we already have an active alert for this today
      const alertExists = alerts.some(a => a.clientId === client.id && a.metric === 'Success Rate' && !a.resolved);
      if (!alertExists) {
        newAlerts.push({
          id: `ALT-LIVE-${client.id}-SR-${Date.now()}`,
          clientId: client.id,
          clientName: client.name,
          metric: 'Success Rate',
          thresholdValue: th.minSuccessRate,
          actualValue: metrics.successRate,
          severity: metrics.successRate < th.minSuccessRate - 5 ? 'critical' : 'warning',
          timestamp: new Date().toISOString(),
          resolved: false,
          notes: `Real-time Success Rate dipped to ${metrics.successRate}% (Threshold: >= ${th.minSuccessRate}%)`
        });
      }
    }

    if (metrics.violations.failureRate) {
      const alertExists = alerts.some(a => a.clientId === client.id && a.metric === 'Failure Rate' && !a.resolved);
      if (!alertExists) {
        newAlerts.push({
          id: `ALT-LIVE-${client.id}-FR-${Date.now()}`,
          clientId: client.id,
          clientName: client.name,
          metric: 'Failure Rate',
          thresholdValue: th.maxFailureRate,
          actualValue: metrics.failureRate,
          severity: metrics.failureRate > th.maxFailureRate + 3 ? 'critical' : 'warning',
          timestamp: new Date().toISOString(),
          resolved: false,
          notes: `Real-time Failure Rate spiked to ${metrics.failureRate}% (Threshold: <= ${th.maxFailureRate}%)`
        });
      }
    }

    if (metrics.violations.retryRate) {
      const alertExists = alerts.some(a => a.clientId === client.id && a.metric === 'Retry Rate' && !a.resolved);
      if (!alertExists) {
        newAlerts.push({
          id: `ALT-LIVE-${client.id}-RR-${Date.now()}`,
          clientId: client.id,
          clientName: client.name,
          metric: 'Retry Rate',
          thresholdValue: th.maxRetryRate,
          actualValue: metrics.retryRate,
          severity: metrics.retryRate > th.maxRetryRate + 5 ? 'critical' : 'warning',
          timestamp: new Date().toISOString(),
          resolved: false,
          notes: `Real-time Retry Rate exceeded ${metrics.retryRate}% (Threshold: <= ${th.maxRetryRate}%)`
        });
      }
    }
  });

  if (newAlerts.length > 0) {
    alerts = [...newAlerts, ...alerts];
    console.log(`Alerts engine triggered ${newAlerts.length} new alerts.`);
  }
}

// Run alerts evaluation every 60 seconds
setInterval(runAlertsEngine, 60000);

// API ROUTES

// 1. System Info & Summary Stats
app.get("/api/summary-stats", (req, res) => {
  const activeAlerts = alerts.filter(a => !a.resolved).length;
  
  // Group by sessionId, get latest record by completedBy
  const sessionsMap = new Map<string, VerificationLog>();
  logs.forEach(log => {
    const sId = log.sessionId || `SESS-FALLBACK-${log.id}`;
    const completedByVal = log.completedBy || log.timestamp;
    const existing = sessionsMap.get(sId);
    if (!existing) {
      sessionsMap.set(sId, log);
    } else {
      const existingCompletedByVal = existing.completedBy || existing.timestamp;
      if (new Date(completedByVal).getTime() > new Date(existingCompletedByVal).getTime()) {
        sessionsMap.set(sId, log);
      }
    }
  });
  const uniqueSessions = Array.from(sessionsMap.values());
  const totalSessions = uniqueSessions.length;

  const getNormalizedStatus = (status: string): 'SUCCESS' | 'FAILED' | 'NOT_PERFORMED' | 'OTHER' => {
    const s = (status || "").toUpperCase();
    if (s === 'SUCCESS' || s === 'RETRIED') return 'SUCCESS';
    if (s === 'FAILED') return 'FAILED';
    if (s === 'NOT_PERFORMED' || s === 'ABANDONED') return 'NOT_PERFORMED';
    return 'OTHER';
  };

  const successCount = uniqueSessions.filter(s => getNormalizedStatus(s.status) === 'SUCCESS').length;
  const failureCount = uniqueSessions.filter(s => getNormalizedStatus(s.status) === 'FAILED').length;
  const notPerformedCount = uniqueSessions.filter(s => getNormalizedStatus(s.status) === 'NOT_PERFORMED').length;
  const retryCount = logs.filter(l => (l.status || "").toUpperCase() === 'RETRIED').length;

  const successAndFailureCount = successCount + failureCount;
  const averageSuccessRate = successAndFailureCount > 0 
    ? parseFloat(((successCount / successAndFailureCount) * 100).toFixed(1)) 
    : 100.0;
  const averageFailureRate = successAndFailureCount > 0
    ? parseFloat(((failureCount / successAndFailureCount) * 100).toFixed(1))
    : 0.0;
  
  const countedCount = successCount + failureCount + notPerformedCount;
  const averageAbandonmentRate = countedCount > 0
    ? parseFloat(((notPerformedCount / countedCount) * 100).toFixed(1))
    : 0.0;
  const averageRetryRate = totalSessions > 0
    ? parseFloat(((retryCount / totalSessions) * 100).toFixed(1))
    : 0.0;

  let startDate: string | undefined;
  let endDate: string | undefined;

  if (logs.length > 0) {
    const times = logs
      .map(l => l.timestamp ? new Date(l.timestamp).getTime() : NaN)
      .filter(t => !isNaN(t));
    if (times.length > 0) {
      startDate = new Date(Math.min(...times)).toISOString();
      endDate = new Date(Math.max(...times)).toISOString();
    }
  }

  res.json({
    totalAttempts: logs.length,
    totalSessions,
    averageSuccessRate,
    averageFailureRate,
    averageAbandonmentRate,
    averageRetryRate,
    activeAlertCount: activeAlerts,
    mongoConnected,
    dataSource: mongoConnected ? 'MongoDB Cloud' : (logs.length > 2000 ? 'Uploaded Raw File' : 'Local DB'),
    clientsCount: clients.length,
    activeClientsCount: clients.filter(c => c.status === 'active').length,
    startDate,
    endDate
  });
});

// 2. Client Management
app.get("/api/clients", (req, res) => {
  res.json(clients);
});

app.post("/api/clients", (req, res) => {
  const { id, thresholds, status } = req.body;
  clients = clients.map(c => {
    if (c.id === id) {
      return {
        ...c,
        thresholds: thresholds ? { ...c.thresholds, ...thresholds } : c.thresholds,
        status: status || c.status
      };
    }
    return c;
  });
  
  // Re-run alert evaluation immediately to reflect changes
  runAlertsEngine();
  res.json({ success: true, clients });
});

// 3. Raw Data logs & Daily Aggregations
app.get("/api/logs/metrics", (req, res) => {
  const { clientId, industry } = req.query;
  
  let filteredClients = clients;
  if (clientId) {
    filteredClients = clients.filter(c => c.id === clientId);
  } else if (industry) {
    filteredClients = clients.filter(c => c.industry === industry);
  }

  const metricsList = filteredClients.map(client => computeClientMetrics(logs, client));
  res.json(metricsList);
});

// Daily aggregated chart data
app.get("/api/logs/daily-trends", (req, res) => {
  const { clientId, days = 14 } = req.query;
  const limitDays = parseInt(days as string);
  const now = new Date();
  const trendsMap: { [date: string]: { date: string, success: number, failure: number, abandonment: number, retry: number, total: number } } = {};

  // Initialize days
  for (let i = limitDays; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    trendsMap[dateStr] = { date: dateStr, success: 0, failure: 0, abandonment: 0, retry: 0, total: 0 };
  }

  // Filter logs
  const filteredLogs = clientId 
    ? logs.filter(l => l.clientId === clientId) 
    : logs;

  // Group by sessionId first
  const sessionsMap = new Map<string, VerificationLog>();
  filteredLogs.forEach(log => {
    const sId = log.sessionId || `SESS-FALLBACK-${log.id}`;
    const completedByVal = log.completedBy || log.timestamp;
    const existing = sessionsMap.get(sId);
    if (!existing) {
      sessionsMap.set(sId, log);
    } else {
      const existingCompletedByVal = existing.completedBy || existing.timestamp;
      if (new Date(completedByVal).getTime() > new Date(existingCompletedByVal).getTime()) {
        sessionsMap.set(sId, log);
      }
    }
  });
  const uniqueSessions = Array.from(sessionsMap.values());

  const getNormalizedStatus = (status: string): 'SUCCESS' | 'FAILED' | 'NOT_PERFORMED' | 'OTHER' => {
    const s = (status || "").toUpperCase();
    if (s === 'SUCCESS' || s === 'RETRIED') return 'SUCCESS';
    if (s === 'FAILED') return 'FAILED';
    if (s === 'NOT_PERFORMED' || s === 'ABANDONED') return 'NOT_PERFORMED';
    return 'OTHER';
  };

  uniqueSessions.forEach(log => {
    const dateStr = (log.completedBy || log.timestamp).split('T')[0];
    if (trendsMap[dateStr]) {
      trendsMap[dateStr].total += 1;
      const normStatus = getNormalizedStatus(log.status);
      if (normStatus === 'SUCCESS') {
        trendsMap[dateStr].success += 1;
      } else if (normStatus === 'FAILED') {
        trendsMap[dateStr].failure += 1;
      } else if (normStatus === 'NOT_PERFORMED') {
        trendsMap[dateStr].abandonment += 1;
      }
    }
  });

  // Calculate retry rate from original raw attempts on that day
  filteredLogs.forEach(log => {
    const dateStr = log.timestamp.split('T')[0];
    if (trendsMap[dateStr]) {
      if ((log.status || "").toUpperCase() === 'RETRIED') {
        trendsMap[dateStr].retry += 1;
      }
    }
  });

  // Calculate percentages
  const result = Object.values(trendsMap).map(day => {
    const successAndFailureCount = day.success + day.failure;
    const successRate = successAndFailureCount > 0
      ? parseFloat(((day.success / successAndFailureCount) * 100).toFixed(1))
      : 100.0;
    const failureRate = successAndFailureCount > 0
      ? parseFloat(((day.failure / successAndFailureCount) * 100).toFixed(1))
      : 0.0;
    
    const countedCount = day.success + day.failure + day.abandonment;
    const abandonmentRate = countedCount > 0
      ? parseFloat(((day.abandonment / countedCount) * 100).toFixed(1))
      : 0.0;
    
    const retryRate = day.total > 0
      ? parseFloat(((day.retry / day.total) * 100).toFixed(1))
      : 0.0;

    return {
      date: day.date,
      successRate,
      failureRate,
      abandonmentRate,
      retryRate,
      volume: day.total // unique sessions
    };
  });

  res.json(result);
});

// 4. Alerts API
app.get("/api/alerts", (req, res) => {
  res.json(alerts);
});

app.post("/api/alerts/resolve", (req, res) => {
  const { id, notes } = req.body;
  alerts = alerts.map(a => {
    if (a.id === id) {
      return { ...a, resolved: true, notes: notes || "Resolved by operator" };
    }
    return a;
  });
  res.json({ success: true, alerts });
});

// Clear/Reset all alerts
app.post("/api/alerts/clear-resolved", (req, res) => {
  alerts = alerts.filter(a => !a.resolved);
  res.json({ success: true, alerts });
});

// Trigger a mock anomaly immediately for a client
app.post("/api/alerts/trigger-simulation", (req, res) => {
  const { clientId, metric } = req.body;
  const client = clients.find(c => c.id === clientId);
  if (!client) {
    return res.status(404).json({ error: "Client not found" });
  }

  const th = client.thresholds;
  let val = 0;
  let severity: 'warning' | 'critical' = 'warning';
  
  if (metric === 'Success Rate') {
    val = th.minSuccessRate - 6.5;
    severity = 'critical';
  } else if (metric === 'Failure Rate') {
    val = th.maxFailureRate + 4.2;
    severity = 'critical';
  } else if (metric === 'Abandonment Rate') {
    val = th.maxAbandonmentRate + 5.1;
    severity = 'warning';
  } else if (metric === 'Retry Rate') {
    val = th.maxRetryRate + 8.0;
    severity = 'critical';
  }

  const newAlert: Alert = {
    id: `ALT-SIM-${client.id}-${Date.now()}`,
    clientId: client.id,
    clientName: client.name,
    metric: metric || 'Success Rate',
    thresholdValue: metric === 'Success Rate' ? th.minSuccessRate : (metric === 'Failure Rate' ? th.maxFailureRate : (metric === 'Abandonment Rate' ? th.maxAbandonmentRate : th.maxRetryRate)),
    actualValue: val,
    severity,
    timestamp: new Date().toISOString(),
    resolved: false,
    notes: `Simulated anomaly triggered for stakeholder review. Metric ${metric} deviated from bounds.`
  };

  alerts = [newAlert, ...alerts];
  res.json({ success: true, alert: newAlert, alerts });
});

// 5. MongoDB Integration Settings
app.get("/api/mongodb/status", (req, res) => {
  res.json({
    connected: mongoConnected,
    uri: activeMongoUri ? `${activeMongoUri.substring(0, 15)}...${activeMongoUri.substring(activeMongoUri.length - 8)}` : "",
    rawUri: activeMongoUri
  });
});

app.post("/api/mongodb/connect", async (req, res) => {
  const { uri } = req.body;
  if (!uri) {
    return res.status(400).json({ error: "MongoDB URI connection string is required" });
  }
  
  const connected = await connectToMongo(uri);
  if (connected) {
    // Attempt to seed mock collections if it is empty to ensure real data works immediately!
    try {
      const dbName = uri.split('/').pop()?.split('?')[0] || "idv-dashboard";
      const db = mongoClient!.db(dbName);
      const collections = await db.listCollections().toArray();
      const colNames = collections.map(c => c.name);
      
      if (!colNames.includes("verification_logs")) {
        console.log("Seeding MongoDB collection 'verification_logs' with initial mock dataset...");
        const seedLogs = generateSyntheticLogs(clients, 10);
        await db.collection("verification_logs").insertMany(seedLogs);
      }
      
      // Let's load the logs from MongoDB database!
      const mongoLogs = await db.collection("verification_logs").find({}).toArray();
      if (mongoLogs.length > 0) {
        logs = mongoLogs.map((ml: any) => ({
          id: ml.id || ml._id.toString(),
          clientId: ml.clientId,
          clientName: ml.clientName,
          timestamp: ml.timestamp,
          userId: ml.userId,
          idType: ml.idType,
          status: ml.status,
          failureReason: ml.failureReason,
          responseTimeMs: ml.responseTimeMs
        }));
        alerts = generateAlertsFromLogs(logs, clients);
      }
    } catch (dbErr) {
      console.warn("Could not query or seed MongoDB database, keeping existing data. Error:", dbErr);
    }

    res.json({ success: true, message: "Connected to MongoDB successfully and loaded records." });
  } else {
    res.status(500).json({ error: "Failed to connect to MongoDB with the provided URI." });
  }
});

app.post("/api/mongodb/disconnect", async (req, res) => {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
  mongoConnected = false;
  activeMongoUri = "";
  // Reset back to normal synthetic logs
  logs = generateSyntheticLogs(clients, 30);
  alerts = generateAlertsFromLogs(logs, clients);
  res.json({ success: true, message: "Disconnected from MongoDB. Reverted dashboard to local data store." });
});

// 6. SMTP / Mail Settings & Manual Report triggers
app.get("/api/reports/logs", (req, res) => {
  res.json(reportLogs);
});

app.post("/api/reports/send", async (req, res) => {
  const { recipients, subject, clientId, includeSummary, customMessage } = req.body;
  
  if (!recipients) {
    return res.status(400).json({ error: "Recipient emails are required" });
  }

  // Calculate stats for the report
  const selectedClient = clientId ? clients.find(c => c.id === clientId) : null;
  const relevantLogs = selectedClient ? logs.filter(l => l.clientId === clientId) : logs;
  
  const total = relevantLogs.length;

  // Group by sessionId, get latest record by completedBy
  const sessionsMap = new Map<string, VerificationLog>();
  relevantLogs.forEach(log => {
    const sId = log.sessionId || `SESS-FALLBACK-${log.id}`;
    const completedByVal = log.completedBy || log.timestamp;
    const existing = sessionsMap.get(sId);
    if (!existing) {
      sessionsMap.set(sId, log);
    } else {
      const existingCompletedByVal = existing.completedBy || existing.timestamp;
      if (new Date(completedByVal).getTime() > new Date(existingCompletedByVal).getTime()) {
        sessionsMap.set(sId, log);
      }
    }
  });
  const uniqueSessions = Array.from(sessionsMap.values());
  const totalSessions = uniqueSessions.length;

  const getNormalizedStatus = (status: string): 'SUCCESS' | 'FAILED' | 'NOT_PERFORMED' | 'OTHER' => {
    const s = (status || "").toUpperCase();
    if (s === 'SUCCESS' || s === 'RETRIED') return 'SUCCESS';
    if (s === 'FAILED') return 'FAILED';
    if (s === 'NOT_PERFORMED' || s === 'ABANDONED') return 'NOT_PERFORMED';
    return 'OTHER';
  };

  const successCount = uniqueSessions.filter(s => getNormalizedStatus(s.status) === 'SUCCESS').length;
  const failureCount = uniqueSessions.filter(s => getNormalizedStatus(s.status) === 'FAILED').length;
  const notPerformedCount = uniqueSessions.filter(s => getNormalizedStatus(s.status) === 'NOT_PERFORMED').length;
  const retryCount = relevantLogs.filter(l => (l.status || "").toUpperCase() === 'RETRIED').length;

  const successAndFailureCount = successCount + failureCount;
  const successRate = successAndFailureCount > 0 
    ? parseFloat(((successCount / successAndFailureCount) * 100).toFixed(1)) 
    : 100.0;
  const failureRate = successAndFailureCount > 0
    ? parseFloat(((failureCount / successAndFailureCount) * 100).toFixed(1))
    : 0.0;
  
  const countedCount = successCount + failureCount + notPerformedCount;
  const abandonmentRate = countedCount > 0
    ? parseFloat(((notPerformedCount / countedCount) * 100).toFixed(1))
    : 0.0;
  const retryRate = totalSessions > 0
    ? parseFloat(((retryCount / totalSessions) * 100).toFixed(1))
    : 0.0;

  // Build a stunning HTML body
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; padding: 40px; color: #1e293b;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: #ffffff; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">1Kosmos IDV Customer Success</h1>
          <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 14px;">Automated SLA & Metric Compliance Report</p>
        </div>

        <!-- Content -->
        <div style="padding: 35px;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
            ${subject || "IDV Metric Digest Report"}
          </h2>
          
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">
            This report was requested automatically for operations and stakeholder reviews. Below is the active metric compilation for 
            <strong>${selectedClient ? selectedClient.name : 'All 20 Clients'}</strong>.
          </p>

          ${customMessage ? `<div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; font-style: italic; font-size: 14px;">"${customMessage}"</div>` : ''}

          <!-- Metric Grid -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0;">
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 15px; text-align: center;">
              <div style="color: #065f46; font-size: 12px; font-weight: 600; text-transform: uppercase;">Success Rate</div>
              <div style="color: #047857; font-size: 28px; font-weight: 700; margin-top: 5px;">${successRate}%</div>
            </div>
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; text-align: center;">
              <div style="color: #991b1b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Failure Rate</div>
              <div style="color: #b91c1c; font-size: 28px; font-weight: 700; margin-top: 5px;">${failureRate}%</div>
            </div>
            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px; text-align: center;">
              <div style="color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase;">Abandonment</div>
              <div style="color: #d97706; font-size: 28px; font-weight: 700; margin-top: 5px;">${abandonmentRate}%</div>
            </div>
            <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 15px; text-align: center;">
              <div style="color: #5b21b6; font-size: 12px; font-weight: 600; text-transform: uppercase;">Retry Rate</div>
              <div style="color: #6d28d9; font-size: 28px; font-weight: 700; margin-top: 5px;">${retryRate}%</div>
            </div>
          </div>

          <!-- Total volume -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="border-bottom: 1px solid #f1f5f9; font-size: 14px;">
              <td style="padding: 10px 0; color: #64748b;">Target Scope</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 600;">${selectedClient ? 'Single Client deep-dive' : 'Company wide (All Clients)'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; font-size: 14px;">
              <td style="padding: 10px 0; color: #64748b;">Total Attempts (Transactions)</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 600;">${total.toLocaleString()} transactions</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; font-size: 14px;">
              <td style="padding: 10px 0; color: #64748b;">Total Unique Sessions</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 15px; color: #4f46e5;">${totalSessions.toLocaleString()} sessions</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; font-size: 14px;">
              <td style="padding: 10px 0; color: #64748b;">Current Active Alerts</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #ef4444;">${alerts.filter(a => !a.resolved).length} active alerts</td>
            </tr>
          </table>
          
          <div style="margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
            This email was generated from the IDV Client Success Dashboard. Configured SMTP services can send directly to stakeholders.
          </div>
        </div>
      </div>
    </div>
  `;

  // Try to send via nodemailer SMTP if environment config exists
  let status: 'sent' | 'failed' = 'failed';
  let logBody = `Sent report. Success Rate: ${successRate}%. verifications: ${total}.`;
  
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"IDV Dashboard Alerts" <alerts@idv-dashboard.com>',
        to: recipients,
        subject: subject || "IDV Client Success Report",
        html: htmlBody,
      });

      status = 'sent';
      logBody += ` Sent via SMTP to ${recipients}.`;
    } catch (smtpErr) {
      console.error("Nodemailer transmission failure:", smtpErr);
      status = 'failed';
      logBody += ` SMTP delivery failed: ${(smtpErr as Error).message}.`;
    }
  } else {
    // In preview context, simulate successful delivery so the user has fully-functional visual pipeline
    status = 'sent';
    logBody += ` [MOCK/PREVIEW MODE] SMTP credentials missing in .env. example preview fully simulated.`;
  }

  const newReportLog: ReportLog = {
    id: `REP-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
    recipientCount: recipients.split(',').length,
    recipients,
    status,
    type: 'manual',
    subject: subject || "IDV Client Success Report",
    previewBody: logBody
  };

  reportLogs = [newReportLog, ...reportLogs];
  res.json({
    success: true,
    message: status === 'sent' && !hasSmtpConfig ? "Report processed successfully (Simulated Preview Delivery)" : "Report transmission completed.",
    log: newReportLog,
    logs: reportLogs,
    renderedHtml: htmlBody
  });
});

// 7. Upload Raw Local Data
app.post("/api/upload-raw", (req, res) => {
  const { data, mode = "append" } = req.body;
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: "Invalid data format. Expected array of verification logs." });
  }

  try {
    const parsedLogs: VerificationLog[] = data.map((item: any, idx: number) => {
      // Clean and default raw input lines
      return {
        id: item.id || `LOG-UPL-${Date.now()}-${idx}`,
        clientId: item.clientId || "CLI-001",
        clientName: item.clientName || clients.find(c => c.id === item.clientId)?.name || "Apex Global Bank",
        timestamp: item.timestamp || new Date().toISOString(),
        userId: item.userId || `user_uploaded_${Math.floor(Math.random() * 100000)}`,
        idType: item.idType || "Passport",
        status: (item.status === 'success' || item.status === 'failed' || item.status === 'abandoned' || item.status === 'retried') ? item.status : 'success',
        failureReason: item.failureReason || undefined,
        responseTimeMs: parseInt(item.responseTimeMs) || 1200
      };
    });

    if (mode === "replace") {
      logs = parsedLogs;
    } else {
      logs = [...parsedLogs, ...logs];
    }

    // Re-evaluate alerts
    alerts = generateAlertsFromLogs(logs, clients);
    
    res.json({
      success: true,
      message: `Successfully processed and ${mode === "replace" ? "replaced" : "imported"} ${parsedLogs.length} logs from raw file.`,
      logsCount: logs.length,
      alertsCount: alerts.length
    });
  } catch (err) {
    res.status(500).json({ error: `File parsing error: ${(err as Error).message}` });
  }
});


// Serve Vite App or static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IDV customer success dashboard backend listening on port ${PORT}`);
  });
}

startServer();
