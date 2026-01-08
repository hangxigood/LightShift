# LightShift 🌌

LightShift is a minimalist, local-first staff scheduling tool designed for speed and simplicity. It allows managers to plan shifts using a visual drag-and-drop calendar without creating an account.

[**👉 Try the Live Demo**](https://hangxigood.github.io/LightShift/)

## ✨ Features

- **Zero-Config Scheduling**: Start planning immediately. No sign-up required.
- **Smart Calendar Interface**:
  - Drag & drop shift management.
  - Auto-creation of staff identities with unique colors.
  - Conflict detection to prevent overlapping shifts for the same person.
- **Local-First Data Privacy**: All data is stored securely in your browser's LocalStorage. It never leaves your device unless you choose to export it.
- **Data Management**:
  - **Storage Insights**: See exactly how much browser storage your schedule uses.
  - **Excel Backup**: Export your entire schedule to a human-readable Excel file (`.xlsx`) for backup or sharing.
  - **Restore**: Import your Excel backups to restore your schedule on any device.
- **Interactive Tutorial**: A guided tour helps new users master the interface in seconds.
- **Premium Aesthetics**: Built with a modern, high-contrast design system using Tailwind CSS 4.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/hangxigood/LightShift.git
    cd LightShift
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser to use the app.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Calendar**: [FullCalendar React](https://fullcalendar.io/docs/react)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with LocalStorage persistence)
- **Data Export**: [SheetJS (xlsx)](https://sheetjs.com/)
- **Typography**: [Google Fonts (Outfit)](https://fonts.google.com/specimen/Outfit)

---

Created with ❤️ by Antigravity.
