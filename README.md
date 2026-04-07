# 🌊 HydroSentry (The Sahel Resilience Stack)

> **Decentralized, offline-first early warning system & geospatial command center for the Lake Chad Basin.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Status: Live Prototype](https://img.shields.io/badge/Status-Live_Prototype-success.svg)]()
[![Frontend: React/Vite](https://img.shields.io/badge/Frontend-React%2018-61DAFB.svg)]()

**🔴 [Access the Live Command Center Demo Here](https://hydrosentry.vercel.app/)** *(Note for Reviewers: The live deployment currently utilizes simulated telemetry data for the Phase 1 Pilot to demonstrate the UI/UX without exposing active community hardware locations).*

HydroSentry is the core geospatial module of **The Sahel Resilience Stack**, an open-source intelligence blueprint engineered for extreme resource-constrained environments. It provides high-availability flood and conflict resource mapping that remains resilient even during severe telecommunication blackouts.

## 📖 The Manifesto: Why This Exists
In conflict-affected and climate-vulnerable regions, standard cloud-native architectures fail. When the power grid collapses and the internet drops, centralized applications become unusable. Furthermore, standard off-the-shelf hardware cannot survive 45°C (113°F) ambient heat. We do not rely on constant connectivity. We build for the edge.

## 🏗️ Architecture & Current Status
*This repository contains the `Command Center Interface` and `Cloud Sync Logic`. (Note: Edge node C++ firmware and TinyML models are maintained in our separate hardware repositories).*

- **The Sync Architecture:** We utilize Supabase (PostgreSQL) for centralized state logic and cross-regional sync. However, during telecom blackouts, the React/Vite Command Center relies on local browser storage (IndexedDB) and local LoRaWAN gateway caches to maintain operational visibility until connectivity is restored.
- **Hardware Hardening:** Standard Li-Po batteries expand and degrade in extreme Sahel heat. HydroSentry open-source hardware specs mandate the use of **LiFePO4** cells housed in vented **Stevenson screen enclosures**.
- **Redundant Alerting:** When internet connectivity is live, we utilize **Termii API edge functions** to bypass regional DND blocks. During total internet blackouts, local LoRaWAN gateways fallback to physical GSM modules (SIM800L) to push SMS alerts directly to cell towers.

## 🌍 Core System Capabilities
* **Zero-Latency Edge Inference (<1s):** Localized anomaly detection using TinyML on low-power sensor microcontrollers directly at the edge.
* **Telecommunications Blackout Resilience:** Complete reliance on localized LoRaWAN mesh topologies for node-to-node communication.
* **Youth-Led Warden Maintenance Protocol:** A decentralized physical maintenance topology executed by the **Orivon Edge Youth Guild**, providing scheduled hardware diagnostics and node rehabilitation.

## 💻 System Topology & Technology Stack

| Layer | Technology | Primary Function |
| :--- | :--- | :--- |
| **Edge Hardware** | LoRaWAN / ESP32 / LiFePO4 | Low-power sensory input, TinyML anomaly detection, and mesh transmission. |
| **Local Gateway** | Raspberry Pi / GSM Module | Local caching and offline SMS dispatch via SIM800L. |
| **Cloud Sync** | Supabase (PostgreSQL) | Geospatial telemetry ingestion, secure RBAC, and data aggregation when online. |
| **Client Interface**| React / Tailwind / shadcn | Clinical command interface, offline-capable viewing, and data visualization. |

## 🤝 Open Source Governance & Contributing
HydroSentry is classified as a **Digital Public Good**. It is maintained by an open-source youth engineering guild operating within Borno State. The infrastructure is designed to empower local communities with digital sovereignty over their early warning systems.

We actively welcome contributions from global developers, GIS specialists, and hardware engineers.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/ResilienceUpdate`)
3. Commit your Changes (`git commit -m 'Enhance offline caching'`)
4. Push to the Branch (`git push origin feature/ResilienceUpdate`)
5. Open a Pull Request

## 🚀 Local Deployment Protocol (Command Center)

```bash
# 1. Clone the repository
git clone [https://github.com/sagegottrill/hydrosentry.git](https://github.com/sagegottrill/hydrosentry.git)

# 2. Navigate to the workspace
cd hydrosentry

# 3. Install system dependencies
npm install

# 4. Set up environment variables
# Note: Production SMS routing requires Supabase Service Role Keys
cp .env.example .env

# 5. Initialize the local command interface
npm run dev
