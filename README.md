# GrowwWorkspace - Collaborative Real-Time EMI Studio

GrowwWorkspace is a production-grade, collaborative financial workspace that synchronizes calculations, comparison scenarios, prepayments, themes, and modes across multiple open browser tabs in real-time. 

Designed like a professional fintech studio (inspired by Groww), the application relies purely on front-end browser APIs (BroadcastChannel) without requiring a server backend, database, or socket server.

## 🚀 Key Features

* **Feature 1: Real-Time EMI Calculator** — Instantly calculates monthly EMI, interest payable, and total amount. Features synchronized slider and input controls, Indian Rupee formatting (INR), and ratio distribution visualization.
* **Feature 2: Dynamic Amortization Schedule** — Displays full month-by-month repayment schedules, highlights the interest/principal break-even month, offers interactive stacked Area Charts, and supports pagination.
* **Feature 3: Loan Comparison Mode** — Supports side-by-side comparative inputs for up to 3 loan packages, dynamically highlights the cheapest scenario, and preserves state when switching tabs.
* **Feature 4: What-If Sensitivity Analysis** — Simulates variations in interest rate ($\pm 1\%$, $\pm 2\%$, $\pm 3\%$) and tenure ($\pm 6$, $\pm 12$, $\pm 24$ months) in a grid, calculating exact EMI shifts and variance compared to the active scenario.
* **Feature 5: Prepayment Planner** — Allows scheduling multiple prepayments, computes tenure reduction, calculates total interest saved, and dynamically redraws the amortization schedule.
* **Feature 6: Shared Workspace (Tab Sync)** — Replicates all inputs, comparison packages, prepayments, themes, and workspace modes across tabs instantly via the BroadcastChannel API.
* **Feature 7: Real-Time Presence System** — Features heartbeat broadcasts, computes active tab counts, and displays the current Tab ID and status in the header.
* **Feature 8: Distributed Leader Election** — When a new tab opens, it discovers the active leader, requests the workspace state, and hydrates instantly. If the leader closes, a new leader is elected.
* **Feature 9: Workspace Undo (Ctrl + Z)** — Supports cross-tab undo capability. A user action in Tab A can be reverted in Tab B using Ctrl + Z.
* **Feature 10: CSV Exporter** — Downloads clean, structured spreadsheets of the Amortization Schedule or Prepayments list.
* **Feature 11: Two-Way URL State Sync** — Synchronizes principal amount, rate, and tenure with URL query parameters for easy workspace sharing.

---

## 🛠️ Technology Stack

* **Core:** Next.js 14+ (App Router, Client Components)
* **Logic & Hooks:** React Hooks, useReducer, Context API
* **Language:** JavaScript (ES6+)
* **Styling:** Tailwind CSS (Dark/Light Modes, custom Glassmorphic panels)
* **Charts:** Recharts
* **Communication:** BroadcastChannel API (Native Browser Web Worker API)
* **Icons:** Lucide React

---

## 📁 Scalable Directory Layout

```text
src/
├── app/
│   ├── globals.css         # Styling, tailwind theme variables, keyframes
│   ├── layout.js           # Google Fonts setup and global context wrapping
│   └── page.js             # View controller, URL sync, and global hotkeys
├── components/
│   ├── Header.js           # Session stats, leader badge, undo, theme toggles
│   ├── EMICalculator.js    # Inputs, Pie chart, and Amortization wrapper
│   ├── AmortizationSchedule.js # Pagination table, stacked Area Chart, CSV exporter
│   ├── LoanComparison.js   # 3 scenarios comparisons, cheapest badge
│   ├── PrepaymentPlanner.js# Lump sum adds, impact summaries, CSV download
│   └── SensitivityAnalysis.js # Rate vs Tenure variance grid
├── context/
│   └── WorkspaceContext.js # Global store, action-reducer, undo history tracker
├── hooks/
│   ├── useBroadcastSync.js # Receives broadcast updates & handles state sync
│   ├── usePresence.js      # Heartbeat publisher, stale tab pruner, tab stats
│   ├── useLeaderElection.js# Initial state requester on mount
│   ├── useThemeSync.js     # Class-based HTML theme toggles
│   ├── useComparison.js    # Computes loan comparisons and finds cheapest
│   ├── usePrepaymentPlanner.js # Computes prepayments impact and new schedule
│   └── useSensitivityGrid.js # Memoizes sensitivity matrix calculations
├── engines/
│   └── financialEngine.js  # Pure math financial formulas (no React deps)
├── services/
│   └── broadcastService.js # Broadcaster singleton class wrapper
├── utils/
│   └── formatters.js       # Indian Currency formatters, CSV download triggers
└── constants/
    ├── actionTypes.js      # Global reducer actions
    └── defaultState.js     # Initial state model
```

---

## ⚙️ Running Locally

Follow these steps to run the application on your computer:

### 1. Install Dependencies
In the root directory of the project, run:
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Open the App in Your Browser
Visit `http://localhost:3000` to interact with the app.
To test real-time synchronization, open multiple browser windows or tabs side-by-side!
