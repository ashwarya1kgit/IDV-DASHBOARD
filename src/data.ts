import { Client, VerificationLog, Alert } from './types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'CLI-001',
    name: 'Apex Global Bank',
    industry: 'Fintech',
    onboardingDate: '2025-01-15',
    avatarColor: '#3B82F6', // Blue
    thresholds: { minSuccessRate: 90, maxFailureRate: 5, maxAbandonmentRate: 8, maxRetryRate: 10 },
    status: 'active',
  },
  {
    id: 'CLI-002',
    name: 'Velo Health Care',
    industry: 'Healthcare',
    onboardingDate: '2025-02-10',
    avatarColor: '#10B981', // Green
    thresholds: { minSuccessRate: 85, maxFailureRate: 8, maxAbandonmentRate: 12, maxRetryRate: 15 },
    status: 'active',
  },
  {
    id: 'CLI-003',
    name: 'Kraken Futures',
    industry: 'Crypto',
    onboardingDate: '2025-03-01',
    avatarColor: '#8B5CF6', // Purple
    thresholds: { minSuccessRate: 88, maxFailureRate: 6, maxAbandonmentRate: 10, maxRetryRate: 12 },
    status: 'active',
  },
  {
    id: 'CLI-004',
    name: 'Zeta Marketplace',
    industry: 'E-Commerce',
    onboardingDate: '2025-03-12',
    avatarColor: '#F59E0B', // Amber
    thresholds: { minSuccessRate: 80, maxFailureRate: 10, maxAbandonmentRate: 20, maxRetryRate: 25 },
    status: 'active',
  },
  {
    id: 'CLI-005',
    name: 'PlaySphere Gaming',
    industry: 'Gaming',
    onboardingDate: '2025-04-05',
    avatarColor: '#EC4899', // Pink
    thresholds: { minSuccessRate: 75, maxFailureRate: 15, maxAbandonmentRate: 25, maxRetryRate: 30 },
    status: 'active',
  },
  {
    id: 'CLI-006',
    name: 'Scribe AI SaaS',
    industry: 'SaaS',
    onboardingDate: '2025-04-20',
    avatarColor: '#06B6D4', // Cyan
    thresholds: { minSuccessRate: 92, maxFailureRate: 4, maxAbandonmentRate: 6, maxRetryRate: 8 },
    status: 'active',
  },
  {
    id: 'CLI-007',
    name: 'Nexa Prime Brokerage',
    industry: 'Fintech',
    onboardingDate: '2025-05-01',
    avatarColor: '#1E3A8A', // Dark Blue
    thresholds: { minSuccessRate: 89, maxFailureRate: 7, maxAbandonmentRate: 10, maxRetryRate: 15 },
    status: 'active',
  },
  {
    id: 'CLI-008',
    name: 'Lumina Diagnostics',
    industry: 'Healthcare',
    onboardingDate: '2025-05-18',
    avatarColor: '#059669', // Dark Green
    thresholds: { minSuccessRate: 86, maxFailureRate: 8, maxAbandonmentRate: 10, maxRetryRate: 12 },
    status: 'active',
  },
  {
    id: 'CLI-009',
    name: 'CoinHaven Custody',
    industry: 'Crypto',
    onboardingDate: '2025-06-02',
    avatarColor: '#6D28D9', // Dark Purple
    thresholds: { minSuccessRate: 90, maxFailureRate: 5, maxAbandonmentRate: 8, maxRetryRate: 10 },
    status: 'active',
  },
  {
    id: 'CLI-010',
    name: 'Mododa Fashion',
    industry: 'E-Commerce',
    onboardingDate: '2025-06-15',
    avatarColor: '#D97706', // Dark Amber
    thresholds: { minSuccessRate: 82, maxFailureRate: 10, maxAbandonmentRate: 15, maxRetryRate: 20 },
    status: 'active',
  },
  {
    id: 'CLI-011',
    name: 'StreamArcade Studio',
    industry: 'Gaming',
    onboardingDate: '2025-07-01',
    avatarColor: '#BE185D', // Dark Pink
    thresholds: { minSuccessRate: 78, maxFailureRate: 12, maxAbandonmentRate: 20, maxRetryRate: 25 },
    status: 'active',
  },
  {
    id: 'CLI-012',
    name: 'LogiFlow Analytics',
    industry: 'SaaS',
    onboardingDate: '2025-07-15',
    avatarColor: '#0891B2', // Dark Cyan
    thresholds: { minSuccessRate: 91, maxFailureRate: 5, maxAbandonmentRate: 7, maxRetryRate: 9 },
    status: 'active',
  },
  {
    id: 'CLI-013',
    name: 'Bancor Trust',
    industry: 'Fintech',
    onboardingDate: '2025-08-01',
    avatarColor: '#2563EB', // Bright Blue
    thresholds: { minSuccessRate: 88, maxFailureRate: 6, maxAbandonmentRate: 10, maxRetryRate: 12 },
    status: 'active',
  },
  {
    id: 'CLI-014',
    name: 'GeneLife Labs',
    industry: 'Healthcare',
    onboardingDate: '2025-08-19',
    avatarColor: '#34D399', // Mint Green
    thresholds: { minSuccessRate: 87, maxFailureRate: 7, maxAbandonmentRate: 9, maxRetryRate: 11 },
    status: 'active',
  },
  {
    id: 'CLI-015',
    name: 'Bullish DAO',
    industry: 'Crypto',
    onboardingDate: '2025-09-02',
    avatarColor: '#A78BFA', // Light Purple
    thresholds: { minSuccessRate: 85, maxFailureRate: 8, maxAbandonmentRate: 12, maxRetryRate: 15 },
    status: 'active',
  },
  {
    id: 'CLI-016',
    name: 'CartVibe Retail',
    industry: 'E-Commerce',
    onboardingDate: '2025-09-20',
    avatarColor: '#FBBF24', // Yellow
    thresholds: { minSuccessRate: 81, maxFailureRate: 10, maxAbandonmentRate: 18, maxRetryRate: 22 },
    status: 'active',
  },
  {
    id: 'CLI-017',
    name: 'Guild Esports',
    industry: 'Gaming',
    onboardingDate: '2025-10-05',
    avatarColor: '#F472B6', // Rose
    thresholds: { minSuccessRate: 77, maxFailureRate: 14, maxAbandonmentRate: 22, maxRetryRate: 28 },
    status: 'active',
  },
  {
    id: 'CLI-018',
    name: 'AuthBlock Identity',
    industry: 'SaaS',
    onboardingDate: '2025-10-22',
    avatarColor: '#22D3EE', // Sky Cyan
    thresholds: { minSuccessRate: 93, maxFailureRate: 3, maxAbandonmentRate: 5, maxRetryRate: 7 },
    status: 'active',
  },
  {
    id: 'CLI-019',
    name: 'Apex Pay Checkout',
    industry: 'Fintech',
    onboardingDate: '2025-11-10',
    avatarColor: '#1D4ED8', // Rich Blue
    thresholds: { minSuccessRate: 90, maxFailureRate: 5, maxAbandonmentRate: 8, maxRetryRate: 10 },
    status: 'active',
  },
  {
    id: 'CLI-020',
    name: 'MediSync Solutions',
    industry: 'Healthcare',
    onboardingDate: '2025-12-01',
    avatarColor: '#047857', // Forest Green
    thresholds: { minSuccessRate: 88, maxFailureRate: 6, maxAbandonmentRate: 8, maxRetryRate: 10 },
    status: 'active',
  },
  {
    id: 'CLI-021',
    name: 'Kforce',
    industry: 'SaaS',
    onboardingDate: '2026-01-10',
    avatarColor: '#4F46E5', // Indigo
    thresholds: { minSuccessRate: 90, maxFailureRate: 5, maxAbandonmentRate: 8, maxRetryRate: 10 },
    status: 'active',
  },
];

// Generate synthetic historical logs for the last 30 days
export function generateSyntheticLogs(clients: Client[] = INITIAL_CLIENTS, days = 30): VerificationLog[] {
  const logs: VerificationLog[] = [];
  const now = new Date();
  
  // ID types
  const idTypes: ('Passport' | 'Drivers_License' | 'National_ID' | 'Biometric')[] = [
    'Passport', 'Drivers_License', 'National_ID', 'Biometric'
  ];
  
  // Failure reasons
  const failureReasons = [
    'Poor lighting / image blur',
    'Document expired',
    'MRZ reading failed',
    'Face mismatch with document',
    'Unsupported document format',
    'Suspected fraudulent forgery',
    'Liveness check failed'
  ];

  // Loop through days from days ago to now
  for (let d = days; d >= 0; d--) {
    const currentDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    
    // For each active client
    clients.forEach((client) => {
      if (client.status !== 'active') return;
      
      // Determine volume for this client on this day (e.g. Fintech has higher, E-Commerce higher on weekends)
      let volumeMultiplier = 1;
      if (client.industry === 'Fintech' || client.industry === 'Crypto') volumeMultiplier = 1.8;
      if (client.industry === 'Gaming' || client.industry === 'E-Commerce') {
        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
        volumeMultiplier = isWeekend ? 1.5 : 0.8;
      }
      
      const baseDailyVolume = 40 + Math.floor(Math.random() * 40);
      const dailyVolume = Math.floor(baseDailyVolume * volumeMultiplier);
      
      // Get threshold values
      const minSuccess = client.thresholds.minSuccessRate;
      const maxFail = client.thresholds.maxFailureRate;
      const maxAbandon = client.thresholds.maxAbandonmentRate;
      const maxRetry = client.thresholds.maxRetryRate;
      
      // We will generate logs matching or slightly violating thresholds dynamically
      // Let's introduce a minor "outlier" trend for certain clients on specific days to trigger alerts
      let successRate = minSuccess + (Math.random() * 8 - 3); // some times drops below threshold
      let failureRate = (100 - successRate) * (0.3 + Math.random() * 0.2);
      let abandonmentRate = (100 - successRate) * (0.4 + Math.random() * 0.2);
      let retryRate = Math.max(2, maxRetry + (Math.random() * 12 - 6)); // retries can spike

      // Inject anomaly for CLI-001 (Apex Bank) on day 2 and day 8 (recent days)
      if (client.id === 'CLI-001' && (d === 1 || d === 7)) {
        successRate = 81.5; // threshold is 90%
        failureRate = 8.5;  // threshold is 5%
        abandonmentRate = 10.0; // threshold is 8%
        retryRate = 18.0;   // threshold is 10%
      }
      // Inject anomaly for CLI-003 (Kraken) on day 0 (today) to show a live trigger!
      if (client.id === 'CLI-003' && d === 0) {
        successRate = 79.2; // threshold is 88%
        failureRate = 9.8;  // threshold is 6%
        abandonmentRate = 11.0;
        retryRate = 24.5;   // threshold is 12%
      }
      
      // Clamp values
      successRate = Math.max(50, Math.min(100, successRate));
      const totalDist = successRate + failureRate + abandonmentRate;
      
      const pSuccess = successRate / 100;
      const pFailure = failureRate / (totalDist || 100);
      
      for (let i = 0; i < dailyVolume; i++) {
        const rand = Math.random();
        
        // Hour of attempt
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const timestamp = new Date(currentDate);
        timestamp.setHours(hour, minute, 0, 0);
        
        const sessionId = `SESS-${client.id}-${d}-${i}`;
        const userId = `usr_${Math.floor(100000 + Math.random() * 900000)}`;
        const idType = idTypes[Math.floor(Math.random() * idTypes.length)];
        
        if (rand < pSuccess) {
          const isRetry = Math.random() * 100 < retryRate;
          if (isRetry) {
            // First attempt (FAILED)
            const firstTimestamp = new Date(timestamp.getTime() - 3 * 60 * 1000); // 3 mins earlier
            logs.push({
              id: `LOG-${client.id}-${d}-${i}-1`,
              clientId: client.id,
              clientName: client.name,
              timestamp: firstTimestamp.toISOString(),
              userId,
              idType,
              status: 'FAILED',
              failureReason: failureReasons[Math.floor(Math.random() * failureReasons.length)],
              responseTimeMs: 1500,
              sessionId,
              completedBy: firstTimestamp.toISOString()
            });
            
            // Second attempt (SUCCESS / retried)
            logs.push({
              id: `LOG-${client.id}-${d}-${i}-2`,
              clientId: client.id,
              clientName: client.name,
              timestamp: timestamp.toISOString(),
              userId,
              idType,
              status: 'RETRIED', // 'retried' represented as SUCCESS under normalization
              responseTimeMs: 1200,
              sessionId,
              completedBy: timestamp.toISOString()
            });
          } else {
            // Normal SUCCESS
            logs.push({
              id: `LOG-${client.id}-${d}-${i}`,
              clientId: client.id,
              clientName: client.name,
              timestamp: timestamp.toISOString(),
              userId,
              idType,
              status: 'SUCCESS',
              responseTimeMs: 800 + Math.floor(Math.random() * 2000),
              sessionId,
              completedBy: timestamp.toISOString()
            });
          }
        } else if (rand < pSuccess + pFailure) {
          // FAILED
          logs.push({
            id: `LOG-${client.id}-${d}-${i}`,
            clientId: client.id,
            clientName: client.name,
            timestamp: timestamp.toISOString(),
            userId,
            idType,
            status: 'FAILED',
            failureReason: failureReasons[Math.floor(Math.random() * failureReasons.length)],
            responseTimeMs: 1500 + Math.floor(Math.random() * 1500),
            sessionId,
            completedBy: timestamp.toISOString()
          });
        } else {
          // NOT_PERFORMED
          logs.push({
            id: `LOG-${client.id}-${d}-${i}`,
            clientId: client.id,
            clientName: client.name,
            timestamp: timestamp.toISOString(),
            userId,
            idType,
            status: 'NOT_PERFORMED',
            responseTimeMs: 500 + Math.floor(Math.random() * 1000),
            sessionId,
            completedBy: timestamp.toISOString()
          });
        }
      }
    });
  }
  
  // Sort logs by timestamp ascending
  return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Generate static alerts from anomalies
export function generateAlertsFromLogs(logs: VerificationLog[], clients: Client[]): Alert[] {
  // Let's analyze logs grouped by client and date, then create alerts
  const alerts: Alert[] = [];
  const clientsMap = new Map(clients.map(c => [c.id, c]));
  
  // Group logs by client & day
  const dailyGroups: { [key: string]: VerificationLog[] } = {};
  logs.forEach(log => {
    const dayKey = log.timestamp.split('T')[0];
    const key = `${log.clientId}_${dayKey}`;
    if (!dailyGroups[key]) dailyGroups[key] = [];
    dailyGroups[key].push(log);
  });
  
  Object.keys(dailyGroups).forEach(key => {
    const [clientId, dayStr] = key.split('_');
    const client = clientsMap.get(clientId);
    if (!client) return;
    
    const clientLogs = dailyGroups[key];
    
    // Group by sessionId
    const sessionsMap = new Map<string, VerificationLog>();
    clientLogs.forEach(log => {
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
    if (totalSessions < 5) return; // ignore extremely low volume days
    
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
    const retryCount = clientLogs.filter(l => (l.status || "").toUpperCase() === 'RETRIED').length;
    
    const successAndFailureCount = successCount + failureCount;
    const successRate = successAndFailureCount > 0
      ? (successCount / successAndFailureCount) * 100
      : 100.0;
    const failureRate = successAndFailureCount > 0
      ? (failureCount / successAndFailureCount) * 100
      : 0.0;
    
    const countedCount = successCount + failureCount + notPerformedCount;
    const abandonmentRate = countedCount > 0
      ? (notPerformedCount / countedCount) * 100
      : 0.0;
    const retryRate = totalSessions > 0
      ? (retryCount / totalSessions) * 100
      : 0.0;
    
    const th = client.thresholds;
    const date = new Date(dayStr + 'T12:00:00Z');
    
    if (successRate < th.minSuccessRate) {
      alerts.push({
        id: `ALT-${clientId}-SR-${dayStr}`,
        clientId,
        clientName: client.name,
        metric: 'Success Rate',
        thresholdValue: th.minSuccessRate,
        actualValue: parseFloat(successRate.toFixed(1)),
        severity: successRate < th.minSuccessRate - 5 ? 'critical' : 'warning',
        timestamp: date.toISOString(),
        resolved: new Date(dayStr).getTime() < new Date().getTime() - 24 * 60 * 60 * 1000, // resolve past days
        notes: `System detected success rate of ${successRate.toFixed(1)}% falling below threshold of ${th.minSuccessRate}%`
      });
    }
    
    if (failureRate > th.maxFailureRate) {
      alerts.push({
        id: `ALT-${clientId}-FR-${dayStr}`,
        clientId,
        clientName: client.name,
        metric: 'Failure Rate',
        thresholdValue: th.maxFailureRate,
        actualValue: parseFloat(failureRate.toFixed(1)),
        severity: failureRate > th.maxFailureRate + 3 ? 'critical' : 'warning',
        timestamp: date.toISOString(),
        resolved: new Date(dayStr).getTime() < new Date().getTime() - 24 * 60 * 60 * 1000,
        notes: `System detected failure rate spike of ${failureRate.toFixed(1)}% exceeding threshold of ${th.maxFailureRate}%`
      });
    }

    if (retryRate > th.maxRetryRate) {
      alerts.push({
        id: `ALT-${clientId}-RR-${dayStr}`,
        clientId,
        clientName: client.name,
        metric: 'Retry Rate',
        thresholdValue: th.maxRetryRate,
        actualValue: parseFloat(retryRate.toFixed(1)),
        severity: retryRate > th.maxRetryRate + 5 ? 'critical' : 'warning',
        timestamp: date.toISOString(),
        resolved: new Date(dayStr).getTime() < new Date().getTime() - 24 * 60 * 60 * 1000,
        notes: `System detected abnormal retry rate of ${retryRate.toFixed(1)}% exceeding threshold of ${th.maxRetryRate}%`
      });
    }
  });
  
  // Sort alerts with critical and unresolved first, then newest
  return alerts.sort((a, b) => {
    if (!a.resolved && b.resolved) return -1;
    if (a.resolved && !b.resolved) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}
