export interface ClientThresholds {
  minSuccessRate: number; // e.g. 85 for 85%
  maxFailureRate: number;  // e.g. 10
  maxAbandonmentRate: number; // e.g. 15
  maxRetryRate: number;    // e.g. 20
}

export interface Client {
  id: string; // CLI-001 to CLI-020
  name: string;
  industry: 'Fintech' | 'Healthcare' | 'E-Commerce' | 'Crypto' | 'Gaming' | 'SaaS';
  onboardingDate: string;
  avatarColor: string;
  thresholds: ClientThresholds;
  status: 'active' | 'inactive';
}

export interface VerificationLog {
  id: string;
  clientId: string;
  clientName: string;
  timestamp: string; // ISO string
  userId: string;
  idType: 'Passport' | 'Drivers_License' | 'National_ID' | 'Biometric';
  // DESIGN_SPEC.md §5 documents SUCCESS | FAILED | NOT_PERFORMED | ABANDONED.
  // RETRIED is retained because the spec's retryRate metric depends on it.
  status: 'SUCCESS' | 'FAILED' | 'NOT_PERFORMED' | 'ABANDONED' | 'RETRIED';
  failureReason?: string;
  responseTimeMs: number;
  sessionId?: string;
  completedBy?: string;
}

export interface ClientMetrics {
  clientId: string;
  clientName: string;
  industry: string;
  totalAttempts: number;
  totalSessions: number;
  successCount: number;
  failureCount: number;
  abandonedCount: number;
  retryCount: number;
  successRate: number; // percentage
  failureRate: number; // percentage
  abandonmentRate: number; // percentage
  retryRate: number; // percentage
  averageResponseTime: number; // ms
  violations: {
    successRate: boolean;
    failureRate: boolean;
    abandonmentRate: boolean;
    retryRate: boolean;
  };
}

export interface Alert {
  id: string;
  clientId: string;
  clientName: string;
  metric: 'Success Rate' | 'Failure Rate' | 'Abandonment Rate' | 'Retry Rate';
  thresholdValue: number;
  actualValue: number;
  severity: 'warning' | 'critical';
  timestamp: string;
  resolved: boolean;
  notes?: string;
}

export interface EmailReportConfig {
  recipients: string[];
  schedule: 'daily' | 'weekly' | 'monthly' | 'disabled';
  includeCharts: boolean;
  metrics: ('success' | 'failure' | 'abandonment' | 'retry')[];
}

export interface ReportLog {
  id: string;
  timestamp: string;
  recipientCount: number;
  recipients: string;
  status: 'sent' | 'failed';
  type: 'automated' | 'manual';
  subject: string;
  previewBody?: string;
}

export interface SystemStats {
  totalAttempts: number;
  totalSessions: number;
  averageSuccessRate: number;
  averageFailureRate: number;
  averageAbandonmentRate: number;
  averageRetryRate: number;
  activeAlertCount: number;
  mongoConnected: boolean;
  dataSource: 'Local DB' | 'MongoDB Cloud' | 'Uploaded Raw File';
  startDate?: string;
  endDate?: string;
}
