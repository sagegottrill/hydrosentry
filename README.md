# 🌊 HydroSentry

> **Decentralized, offline-first early warning system & geospatial command center for the Lake Chad Basin.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Status: Prototype](https://img.shields.io/badge/Status-Phase_1_Prototype-orange.svg)]()
[![Frontend: React/Vite](https://img.shields.io/badge/Frontend-React%2018-61DAFB.svg)]()

HydroSentry is an open-source, decentralized intelligence blueprint engineered for extreme resource-constrained environments. It provides high-availability flood and conflict resource mapping that remains resilient even during severe telecommunication blackouts.

## 🏗️ Current Project Status: Phase 1 (UI & Architecture)
*This repository is actively under development.*
- **Currently Implemented (Main Branch):** The complete React/Vite Command Center SPA, strictly typed domain models, and mocked telemetry state management to demonstrate the UX/UI architecture.
- **In Active Development (Feature Branches):** Supabase PostgreSQL integration, Termii API SMS edge functions, and ESP32/TinyML C++ firmware for the physical hardware nodes. 

## 🌍 Core System Capabilities

* **Zero-Latency Edge Inference (<1s):** Localized anomaly detection using TinyML on low-power sensor microcontrollers directly at the edge, removing dependency on cloud round-trips for critical threshold alerting.
* **Telecommunications Blackout Resilience:** Complete reliance on localized LoRaWAN mesh topologies, ensuring high-availability telemetry transmission independent of cellular or broadband infrastructure.
* **Youth-Led Warden Maintenance Protocol:** A decentralized physical maintenance topology executed by trained local youth wardens, providing scheduled hardware diagnostics and node rehabilitation.

## 💻 System Topology & Technology Stack

| Layer | Technology | Primary Function |
| :--- | :--- | :--- |
| **Edge Hardware** | LoRaWAN / ESP32 / JSN-SR04T | Low-power sensory input, TinyML anomaly detection, and mesh transmission. |
| **Command Backend** | Supabase (PostgreSQL) / Edge Functions | Geospatial telemetry ingestion, Termii SMS dispatch, and state management. |
| **Client Interface** | React / Tailwind / shadcn-ui | Clinical command interface, offline-first interactions, and data visualization. |

## 🚀 Local Deployment Protocol

## 🤝 Open Source Governance & Contributing
----------------------------------------

HydroSentry is classified as a **Digital Public Good**. It is maintained by an open-source youth engineering guild operating within Borno State. The infrastructure is designed to empower local communities with digital sovereignty over their early warning systems.

We actively welcome contributions from global developers, GIS specialists, and hardware engineers.

1.  Fork the Project
    
2.  Create your Feature Branch (git checkout -b feature/AmazingFeature)
    
3.  Commit your Changes (git commit -m 'Add some AmazingFeature')
    
4.  Push to the Branch (git push origin feature/AmazingFeature)


The following commands establish the local command environment.

```bash
# 1. Clone the repository
git clone [https://github.com/sagegottrill/hydrosentry.git](https://github.com/sagegottrill/hydrosentry.git)

# 2. Navigate to the workspace
cd hydrosentry

# 3. Install system dependencies
npm install

# 4. Set up environment variables
# Copy the example env file and add your Supabase/Termii keys
cp .env.example .env

# 5. Initialize the local command interface
npm run dev


    
5.  Open a Pull Request
    

_Engineered in Maiduguri, Borno State, Nigeria._
