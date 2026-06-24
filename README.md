<div align="center">
  <h1>🚀 Runway Career Connect</h1>
  <p><strong>Nepal's Premier Esports & Digital Marketing Event Platform</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#environment-variables">Environment Setup</a> •
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

---

## 🌟 Overview

**Runway Career Connect** is a highly-optimized, premium landing page and registration platform built to handle high-traffic event registrations. It features an intense **PUBG Mobile Esports Tournament** alongside a cutting-edge **Digital Marketing with AI Workshop**.

Designed with absolute precision, the platform features OS-level micro-interactions, live-syncing data from Google Sheets, and a fully responsive ultra-modern design to maximize user engagement and virality.

---

## ✨ Premium Features

- **⚡ Live Data Synchronization**: Integrates directly with the `googleapis` library to pull live registration capacities and stats from a secured Google Sheet without needing a complex backend database.
- **📱 Native Mobile Virality**: Implements the Native Web Share API (`navigator.share`), allowing users on mobile devices to instantly share the event via WhatsApp, Instagram DMs, or AirDrop.
- **🎨 Cinematic UI/UX**: Built with a dark-mode first aesthetic featuring breathing ambient gradients, glowing text, custom UI scrollbars, and tactile OS-level button animations.
- **🪄 Magic Layout Animations**: Uses `framer-motion` layout animations to create gliding, seamless navigation tabs that feel like a native mobile application.
- **🚀 Ultra-Fast Performance**: Fully optimized Next.js 15 Server-Side generation with aggressive caching (`revalidate`) to guarantee `<10ms` response times in production.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database Backend**: [Google Sheets API](https://developers.google.com/sheets/api)
- **Deployment**: [Vercel](https://vercel.com)

---

## 🔐 Environment Variables

To run this project locally or in production, you must configure a Google Cloud Service Account and securely provide its credentials.

Create a `.env` file in the root of your project:

```env
# Google Service Account Email
GOOGLE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"

# Google Private Key (Must include the BEGIN/END headers, exactly as provided in the JSON file)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBAD...[YOUR KEY]...\n-----END PRIVATE KEY-----\n"

# The Google Sheet IDs (Found in the URL of the Google Sheet)
SHEET_ID_PUBG="your_pubg_sheet_id_here"
SHEET_ID_AI="your_ai_sheet_id_here"
```

*⚠️ Ensure the Google Sheet is shared with your Service Account Email with "Viewer" access.*

---

## 💻 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/stayrahul/octave-event.git
cd octave-event
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. In development mode, API caching is disabled to ensure you always see live Google Sheet data.

---

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new). 

**Important:** When deploying to Vercel, ensure you copy all 4 of your variables from `.env` directly into Vercel's Environment Variables settings before triggering the build!

---
<div align="center">
  <i>Developed with ❤️ by Rahul Kushwaha</i>
</div>
