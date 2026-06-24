# Design Specification: IDV Client Success Dashboard
*A high-fidelity monitoring, SLA diagnostics, and real-time alerting platform for Identity Verification (IDV) client portfolios.*

This comprehensive design and architecture specification outlines the structural, visual, functional, and technical specifications of the **IDV Client Success Dashboard**. It is designed to be downloaded and imported directly into development environments (such as **VS Code**) to guide production-level enhancements, code generation, refactoring, and integrations.

---

## 1. Executive Summary & Purpose

The **IDV Client Success Dashboard** serves as an enterprise-grade, real-time telemetry and service-level agreement (SLA) diagnostics system for **20 active identity verification clients**. 

### Core Product Objectives
*   **SLA Compliance Auditing**: Real-time detection of SLA breaches (success rate dips, failure spikes, abandonment rates, retry issues).
*   **Deduplicated Session Telemetry**: Capability to distinguish raw log events (attempts) from resolved unique sessions to maintain transactional accuracy.
*   **Configurable Threshold Alerting**: Real-time alert lifecycle management (warning/critical severity) with client-specific threshold overrides.
*   **Automated Verification Report Engine**: Simulated and manually triggered PDF/Email report dispatching with detailed historic logs.
*   **Hybrid Ingestion Pipelines**: Multi-source support including an offline-first browser sandbox, an interactive MongoDB cloud pipeline, and raw CSV/JSON log file uploads.

---

## 2. Technical Stack & Environment

The platform is designed around a modern full-stack TypeScript framework compiled to optimize low-latency rendering, clean modular state, and reliable containerized startup.

| Technology Layer | Framework / Library | Purpose |
| :--- | :--- | :--- |
| **Frontend Runtime** | React 19 + Vite 6 | Rapid component rendering and efficient bundle delivery |
| **Styles & Layout** | Tailwind CSS v4 | Utility-first styling with responsive breakpoint grids |
| **Micro-Animations**| Motion (Framer) | Smooth tab transitions, visual telemetry alerts, status pulses |
| **Telemetry Charts** | Recharts | Multi-axes timelines, SLA trend indicators, custom tooltips |
| **Icons Library** | Lucide React | High-contrast, scalable vector icons |
| **Backend Framework** | Express 4.21 | API proxy layer, MongoDB query proxy, and NodeMailer agent |
| **Dev Environment** | TSX (TypeScript Execute) | Direct runtime evaluation of TS servers in dev mode |
| **Build Compiler** | ESBuild | Bundles TS files into a single, optimized CJS `dist/server.cjs` |

---

## 3. Visual Identity & Design System

The visual design is structured to maximize legibility of multi-dimensional telemetry, maintaining a clean, highly structured layout with high-contrast color codes indicating metric status.

### 3.1 Color Palette
The platform uses functional color cues to represent SLA status levels and data states without relying on overwhelming color blocks:

*   **Primary Backdrop**: `bg-slate-50` (soft off-white for desktop layout) and dark canvas segments (`from-slate-900 to-indigo-950`).
*   **Primary Card Surface**: `bg-white` with fine borders (`border-slate-200`) and soft shadows (`shadow-sm`).
*   **SLA Compliance State**: 
    *   **Optimal**: `emerald-500` / `bg-emerald-50` / `text-emerald-700` (SLA Healthy)
    *   **Warning/Degraded**: `amber-500` / `bg-amber-50` / `text-amber-700` (Approaching SLA limits)
    *   **Critical/Breached**: `rose-500` / `bg-rose-50` / `text-rose-700` (SLA Breached)
*   **Accent Channels**: `indigo-600` / `bg-indigo-50` / `text-indigo-800` (Deduplicated Unique Session highlights).

### 3.2 Typography Guidelines
Clean, modern font pairing is established to balance numeric telemetry with literal text labels:

*   **UI Controls & Labels**: **Inter** (`font-sans`) — lightweight, highly readable sans-serif.
*   **Telemetry Headers**: **Space Grotesk** or **Outfit** (`font-display font-bold tracking-tight`) — modern display geometric sans-serif to elevate the layout design.
*   **Data, Codes, & Counters**: **JetBrains Mono** or **Fira Code** (`font-mono`) — highly distinct character spacing to prevent misreading of system IDs, percentages, and metrics.

### 3.3 Micro-interactions & Pulses
To distinguish real-time active pipelines from static snapshots, the interface utilizes:
*   **Interactive Hover States**: Buttons and selector cards transition gracefully (`transition-all hover:border-slate-300 hover:shadow-md`).
*   **Telemetry Status Indicator**: A glowing green pulse (`h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse`) in headers to represent active server connection.

---

## 4. UI Layout & Structural Specification

The application layout is structured using a responsive, fluid desktop-first design with a standard maximum layout container of `w-full max-w-7xl mx-auto`.

```
+-------------------------------------------------------------------------------+
|                             IDV SUCCESS HEADER                                |
|  [Dashboard Status]   [Active Tab: Overview | Deep-Dive | Alerts | Config]    |
+-------------------------------------------------------------------------------+
|                                                                               |
|  1. GLOBAL SLA METRIC BAR (Total Attempts | Success Rate | Active Alerts)      |
|                                                                               |
|  2. MAIN TAB WORKSPACE                                                        |
|     +----------------------------------------------------------------------+  |
|     |  ACTIVE VIEW: CLIENT DEEP-DIVE                                       |  |
|     |                                                                      |  |
|     |  [Top Banner]                                                        |  |
|     |  Active Client Title: Fintech Secure (CLI-001)                       |  |
|     |                                                                      |  |
|     |  +---------------------------+   +--------------------------------+  |  |
|     |  | Profile & Configuration   |   | Active SLA Metric Thresholds   |  |  |
|     |  | Industry: Fintech         |   | Success Rate Limit: >= 95%     |  |  |
|     |  | Status: Active            |   | Failure Rate Limit: <= 5%      |  |  |
|     |  | Select Client Dropdown    |   | [Edit Thresholds Override]     |  |  |
|     |  +---------------------------+   +--------------------------------+  |  |
|     |                                                                      |  |
|     |  +----------------------------------------------------------------+  |  |
|     |  | Trend Chart: Verification Volume (Success vs. Failures)        |  |  |
|     |  +----------------------------------------------------------------+  |  |
|     |                                                                      |  |
|     |  +--------------------------+   +---------------------------------+  |  |
|     |  | Raw vs Unique Session    |   | Verification Log Stream         |  |  |
|     |  | Aggregator               |   | Live JSON / CSV logs & reasons  |  |  |
|     |  +--------------------------+   +---------------------------------+  |  |
|     +----------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### 4.1 Views Specification

#### View A: Unified Dashboard Overview
*   **System Health Grid**: Displays raw transactions, deduplicated unique sessions, overall success, failure, abandonment, and retry rates.
*   **Trend Visualizer**: Staggered bar and area charts displaying historical verification volume over time.
*   **Live Violation Monitor**: Multi-client compliance viewport that isolates clients with active SLA violations.

#### View B: Client Deep-Dive (Target Tab)
*   **Contextual Banner**: Dark indigo gradient header highlighting the current active client name, industry, onboarding date, and system-wide SLA compliance status.
*   **Interactive Client Selector**: Placed directly above the SLA charts workspace, this dropdown updates state instantly and cascades parameters across the view.
*   **SLA Limits Monitor**: Allows users to configure and save customized threshold limits per client (stored persistently in memory/databases).
*   **Trend Timelines**: Dual-timeline visualizations representing daily success/failure volume alongside average verification response times.
*   **Ingestion Feed**: Filterable log streams displaying verification logs complete with session ID, identity document type, outcome status, and detailed error codes.

#### View C: Alerts Center
*   **Active vs. Resolved Feed**: Separates warnings (amber) and critical issues (rose).
*   **Resolution Log**: Interactive text area for engineers to resolve triggers, input root causes, and write incident remediation notes.

#### View D: Ingestion & System Integrations
*   **Manual CSV/JSON Uploader**: Drag-and-drop or manual browser selector with automated validation.
*   **MongoDB Live Connection Pipeline**: Real-time Mongo connection form requiring host string, authentication parameters, and active streaming logs.
*   **NodeMailer Report Settings**: Configuration panel to manage scheduled delivery of compliance digests.

---

## 5. TypeScript Core Interfaces (`/src/types.ts`)

These models ensure strict data parsing and strong compile-time guarantees:

```typescript
export interface ClientThresholds {
  minSuccessRate: number;      // Target minimum success percentage (e.g., 95)
  maxFailureRate: number;      // Maximum tolerated failure percentage (e.g., 5)
  maxAbandonmentRate: number;  // Maximum tolerated drop-off rate (e.g., 10)
  maxRetryRate: number;        // Maximum tolerated authentication retries (e.g., 15)
}

export interface Client {
  id: string;                  // Format: CLI-001 to CLI-020
  name: string;
  industry: 'Fintech' | 'Healthcare' | 'E-Commerce' | 'Crypto' | 'Gaming' | 'SaaS';
  onboardingDate: string;      // Format: YYYY-MM-DD
  avatarColor: string;         // Tailwind color code string
  thresholds: ClientThresholds;
  status: 'active' | 'inactive';
}

export interface VerificationLog {
  id: string;                  // Distinct transaction log ID
  clientId: string;
  clientName: string;
  timestamp: string;           // ISO 8601 string
  userId: string;
  idType: 'Passport' | 'Drivers_License' | 'National_ID' | 'Biometric';
  status: 'SUCCESS' | 'FAILED' | 'NOT_PERFORMED' | 'ABANDONED';
  failureReason?: string;      // Detail on FAILED/ABANDONED states
  responseTimeMs: number;
  sessionId?: string;          // Session grouping ID for deduplication
  completedBy?: string;        // Agent signature or platform version
}

export interface ClientMetrics {
  clientId: string;
  clientName: string;
  industry: string;
  totalAttempts: number;       // Raw transactions count
  totalSessions: number;       // Deduplicated session count
  successCount: number;
  failureCount: number;
  abandonedCount: number;
  retryCount: number;
  successRate: number;         // Calculated (success / totalSessions) * 100
  failureRate: number;         // Calculated (failure / totalSessions) * 100
  abandonmentRate: number;     // Calculated (abandoned / totalSessions) * 100
  retryRate: number;           // Calculated (retry / totalSessions) * 100
  averageResponseTime: number; // Mean milliseconds
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
```

---

## 6. Implementation & Bundle Guidelines

To implement, modify, or extend this code within **VS Code**, follow these core environment guidelines:

### 6.1 Port Binding
*   **Binding Rule**: The server must strictly bind to port **`3000`** and host **`0.0.0.0`** (mandatory for container routing).
*   **Variable Exemption**: Do not override the port configuration using dynamic system environment parameters.

### 6.2 Production Compilation (`package.json`)
The compilation utilizes an esbuild compiler bundling process. It bundles the full Express backend into a single CommonJS (`dist/server.cjs`) to prevent ESModule import errors at runtime.

Ensure your build and run scripts in VS Code match:
```json
"scripts": {
  "dev": "tsx server.ts",
  "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
  "start": "node dist/server.cjs"
}
```

### 6.3 Database Integrations
*   **Primary Database**: Designed around Firebase (Firestore) for durable telemetry state storage.
*   **Ingestion Proxies**: Configured server-side to fetch, write, and process remote MongoDB transaction collections securely, preventing browser exposure of critical cluster credentials.

---

*This document was auto-generated to provide a blueprint for replicating the IDV Success Telemetry design in VS Code.*
