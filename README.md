# 🏰 Sovereign Tree — Worldwide Archive of Noble Houses & Lineages

> A stylish, full-stack family tree application designed for sovereign houses, ancient clans, and founding families across the globe.

---

## 🌟 Key Capabilities

### 1. 🌍 Interactive 3D World Globe & Live Atlas
- **Orbital 3D Projection**: Interactive canvas rendering rotating globe with continental landmasses, glowing atmosphere, and pulsating heraldic house pins.
- **Bilateral Alliance Arcs**: Great circle flight/treaty paths visually connecting allied houses across continents.
- **Live Sitewide Statistics**: Real-time counter of total houses enrolled, living kinfolk, sealed marriages, revered ancestors, and connected nations.

### 2. 🌳 Dynamic Responsive Family Tree (All Screen Sizes)
- **Pan & Zoom Canvas**: Smooth dragging, zooming (35% to 250%), fit to screen, and quick resets.
- **Love-Styled Connection Lines**: Romantic curved bezier arcs linking spouses with animated heartbeat badges (`❤️ Sealed Bond`, `💍 Alliance`).
- **Marriage Dropdown Junctions**: Children cleanly drop down from the central marriage bond node.
- **Generation Filters**: Filter by Patriarchs (Gen 1), Current Era (Gen 2), or Heirs (Gen 3 & 4).

### 3. 🛡️ Strict Lineage & Marital Status Logic
- **Strict Gender Filtering**:
  - **Father Dropdown**: Displays **Males Only**.
  - **Mother Dropdown**: Displays **Females Only**.
- **Marital Status Protocols**:
  - **Single**: All spouse-related fields are completely hidden.
  - **Non-Single (Married / Widowed / Divorced / Engaged)**: Displays spouse house selector from the archive.
  - **Opposite-Sex Matching**: Filters members of the selected house to show only candidates of opposite sex.
  - **Male Polygyny Support**: Dedicated radio question: *"Multiple Wives? [Yes / No]"*. Selecting *Yes* provides dynamic repeater rows with individual status (*Living*, *Divorced*, *Deceased*), house origin, and marriage dates.
  - **Female Remarriage / Widow Support**: Specialized labels for female lineages: *"Widow of whom"* and *"Divorced of whom"*.
  - **Founding New House for Spouse**: If a spouse's house is not yet in the archive, founders can charter it on the spot. The spouse is automatically appointed **Temporary Head**, and auto-generated credentials (temp login email, password, sovereign claim token) are dispatched.

### 4. 👑 Multi-Tier Governance & Role Switching
- **Site Owner / Archive Keeper**: Absolute command over all houses, members, roles, direct marriage sealing, and global decrees.
- **House Head (Lord Sovereign)**: Manages house rolls, approves member submissions, and ratifies marriage alliances.
- **House Member**: Updates personal profile, submits children/spouse additions, and drafts notices for approval.
- **Global Public Visitor**: Explores public globe and house summaries without accessing private records; can join via referral code or found a family.

### 5. 📜 Community Boards & Referrals
- **Royal Notice Board**: Proclamations, scrolls, and announcements with like counters and approval queues.
- **Conclaves & Event Board**: Clan gatherings, reunions, weddings, and memorials with RSVP tracking.
- **Referral Code System**: Unique codes (e.g. `STIRLING-7421`) for inviting kinfolk directly to their house roll.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, HTML5 Canvas 3D Globe, Canvas Confetti
- **Backend**: Node.js, Express 5, Persistent JSON File Store (`server/data/store.json`)
- **Build Tool**: Vite 8 with concurrent dev orchestrator

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
git clone <your-repo-url>
cd "Family Tree"
npm install
```

### Running Locally
```bash
# Start both server and client concurrently
npm run dev

# Or run server directly (serves frontend build statically on port 5000)
npm run build
node server/index.js
```

Open your browser at **`http://localhost:5000`** (or `http://localhost:5173` in dev mode).

---

## 📜 License
ISC License
