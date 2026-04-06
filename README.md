# 🌊 HydroSentry (The Sahel Resilience Stack)

> **Decentralized, offline-first early warning system & geospatial command center for the Lake Chad Basin.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Status: Live Prototype](https://img.shields.io/badge/Status-Live_Prototype-success.svg)]()
[![Frontend: React/Vite](https://img.shields.io/badge/Frontend-React%2018-61DAFB.svg)]()

HydroSentry is the core module of **The Sahel Resilience Stack**, an open-source intelligence blueprint engineered for extreme resource-constrained environments. It provides high-availability flood and conflict resource mapping that remains resilient even during severe telecommunication blackouts.

## 📖 The Manifesto: Why This Exists
In conflict-affected and climate-vulnerable regions like the Lake Chad Basin, standard cloud-native architectures fail. When the power grid collapses and the internet drops, centralized applications become unusable. Furthermore, standard hardware cannot survive 45°C (113°F) ambient heat. We do not rely on constant connectivity. We build for the edge.

## 🏗️ Current Project Status: Live Integration
*This repository has transitioned from UI wireframes to a live, data-driven prototype.*
- **Currently Implemented (Main Branch):** The React/Vite Command Center, live Supabase PostgreSQL database integration, dynamic Role-Based Access Control (RBAC) user management, and **live Termii API SMS edge functions** for automated warden dispatch.
- **Hardware Strategy:** Standard Li-Po batteries expand and degrade in extreme Sahel heat. HydroSentry open-source hardware specs mandate the use of **LiFePO4** cells housed in vented **Stevenson screen enclosures**.

## 🌍 Core System Capabilities
* **Zero-Latency Edge Inference (<1s):** Localized anomaly detection using TinyML on low-power sensor microcontrollers directly at the edge.
* **Telecommunications Blackout Resilience:** Complete reliance on localized LoRaWAN mesh topologies.
* **Youth-Led Warden Maintenance Protocol:** A decentralized physical maintenance topology executed by the **Orivon Edge Youth Guild**, providing scheduled hardware diagnostics and node rehabilitation.

## 💻 System Topology & Technology Stack

| Layer | Technology | Primary Function |
| :--- | :--- | :--- |
| **Edge Hardware** | LoRaWAN / ESP32 / LiFePO4 | Low-power sensory input, TinyML anomaly detection, and mesh transmission. |
| **Command Backend** | Supabase (PostgreSQL) | Geospatial telemetry ingestion, secure team management, and state logic. |
| **Alert Dispatch** | Termii API | Transactional, dynamic SMS dispatch to bypass regional DND blocks. |
| **Client Interface** | React / Tailwind / shadcn | Clinical command interface, offline-first interactions, and data visualization. |

## 🤝 Open Source Governance & Contributing
HydroSentry is classified as a **Digital Public Good**. It is maintained by an open-source youth engineering guild operating within Borno State. The infrastructure is designed to empower local communities with digital sovereignty over their early warning systems.

We actively welcome contributions from global developers, GIS specialists, and hardware engineers.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🚀 Local Deployment Protocol

```bash
# 1. Clone the repository
git clone [https://github.com/sagegottrill/hydrosentry.git](https://github.com/sagegottrill/hydrosentry.git)

# 2. Navigate to the workspace
cd hydrosentry

# 3. Install system dependencies
npm install

# 4. Set up environment variables
# Note: Production SMS routing requires Supabase Service Role Keys (Not exposed to client)
cp .env.example .env

# 5. Initialize the local command interface
npm run dev
