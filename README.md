# 📈 IPO Equity & Investment Manager

> A precision-engineered financial dashboard for managing group IPO investments, calculating complex equity splits, and tracking demat account allocations.

[![Status](https://img.shields.io/badge/Status-Production-success?style=flat-square)](https://ipo-manager.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-React_|_TypeScript_|_Vite-blue?style=flat-square)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

## 🚀 Live Application
**Access the dashboard here:** [https://ipo-manager.vercel.app](https://ipo-manager.vercel.app)

---

## ⚡️ Key Features

### 🔐 Local-First Persistence (New)
* **Auto-Save:** Data is automatically saved to your browser's local storage. You can close the tab or refresh the page without losing your work.
* **Privacy Focused:** No data is sent to external servers. Your financial data stays on your device.

### 💰 Precision Financial Engine
* **Zero-Dust Calculation:** Uses specialized logic to handle floating-point errors (e.g., `0.1 + 0.2`), ensuring every paisa is accounted for.
* **Gap Funding Logic:** Automatically detects when participant investments don't cover the full lot price and attributes the "Gap" to the Demat Account owner.
* **Smart Commission:** Calculates platform fees/commissions only on **Profits**, never on the principal amount or losses.

### 📊 Comprehensive Management
* **Multi-IPO Support:** Manage dozens of concurrent IPO applications in one dashboard.
* **Demat Account Hub:** Track utilization and commission rates across different accounts (Zerodha, Groww, etc.).
* **Consolidated View:** A master table showing every participant's total exposure and P&L across all IPOs.

---

## 🛠 Tech Stack

This project is architected with modern software engineering standards:

* **Core:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS, Shadcn UI (Radix Primitives)
* **Icons:** Lucide React
* **State Management:** React Hooks with LocalStorage persistence layer
* **Build Tooling:** ESLint, PostCSS

---

## 📖 User Guide

### 1. Setup & Configuration
* **Create an IPO:** Enter the IPO Name, Lot Price, and Share Count. The system auto-calculates the Issue Price.
* **Add Accounts:** Register Demat accounts (e.g., "Family Account - Zerodha"). You can set a specific **Commission Rate** (e.g., 20% on profit) for each account.

### 2. Managing Investments
* **Add Participants:** Add investors to a specific IPO.
* **Visual Ownership:** The table visualizes exactly how much of a "Lot" a participant owns.
* **Gap Handling:** If an IPO costs ₹15,000 and participants only invest ₹5,000, the system automatically assigns the remaining ₹10,000 risk/reward to the Account Owner.

### 3. Processing Results
* **Record Outcomes:** Once allotment is out, mark the account as **Allotted** or **Not Allotted**.
* **Enter Exit Price:** If allotted, enter the selling price.
* **Instant P&L:** The system instantly calculates:
    1.  Gross Profit
    2.  Commission Deduction (if applicable)
    3.  Net Final Amount to be returned to each participant.

### 4. Reporting
* **Final Report:** View a detailed breakdown of who is owed what.
* **Export:** Download a CSV file for permanent record-keeping or Excel analysis.

---

## 💻 Local Development

If you want to run this project locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/hrshmakwana/ipo-manager.git
    cd ipo-manager
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```

---

## 🛡 Disclaimer
This tool is for calculation and management purposes only. It does not initiate actual financial transactions or bank transfers. Please verify all calculations before settling payments.

---

<div align="center">
  <p>Architected by <b>Harsh Makwana</b></p>
  <p>
    <a href="https://github.com/hrshmakwana">GitHub</a> • 
    <a href="https://www.linkedin.com/in/hrshmakwana">LinkedIn</a>
  </p>
</div>
