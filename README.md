# ElecZen

ElecZen is a browser-based electronics circuit simulator and visual editor. The project provides an interactive canvas to draw, inspect, and simulate electronic circuits right in your browser.

## Features

- **Interactive Canvas:** High-performance rendering engine built with [PixiJS](https://pixijs.com/).
- **Circuit Simulation:** Fast and reliable electronics simulation powered by `eecircuit-engine`.
- **Modern UI:** Built using [SolidJS](https://solidjs.com/) for reactive, high-performance UI components, styled with [Tailwind CSS v4](https://tailwindcss.com/).
- **Tooling:** Bundled with [Vite](https://vitejs.dev/) for lightning-fast HMR and optimized builds.
- **Backend Services:** A dedicated backend powered by [Hono](https://hono.dev/) handling API operations, structured data parsing using [Drizzle ORM](https://orm.drizzle.team/), and user management via [Better Auth](https://better-auth.com/).

## Project Structure

- `/src` - Frontend SolidJS application, including UI layouts, the PixiJS canvas, and editor pages.
- `/src/simulation` - Integration with the circuit simulation engine.
- `/server` - Backend Hono application API and related services.
- `/src/store` - Application state management.

## Getting Started

### Prerequisites

You can use `bun`, `npm`, or `pnpm` depending on your preference. Since the backend utilizes Bun, having [Bun](https://bun.sh/) installed locally is highly recommended.

### Installation

1. **Install Frontend Dependencies:**
   ```bash
   bun install
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   bun install
   ```

### Development

To start the frontend development server:

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser. The page will reload if you make edits.

## Build for Production

To build the application for production, run:

```bash
bun run build
```

The optimized static files will be generated in the `dist` folder, ready to be deployed to any static hosting provider.

