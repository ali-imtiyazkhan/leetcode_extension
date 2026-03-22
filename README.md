# LeetCode Collab Monorepo

This project is a monorepo containing a browser extension, a real-time backend, and a web platform for collaborative LeetCode solving.

## Getting Started

### 1. Install Dependencies
Run this at the **root** of the project:
```bash
npm install
```

### 2. Run in Development
Run this at the **root** of the project:
```bash
npm run dev
```
This will start:
- **Backend**: `localhost:3001` (Real-time presence & signaling)
- **Web App**: `localhost:3000` (Platform dashboard)
- **Extension**: Automatically builds/watches in `apps/extension/dist`

### 3. Load the Extension
1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `apps/extension` folder.

## Project Structure
- `apps/web`: Next.js frontend.
- `apps/extension`: Browser extension source.
- `apps/backend`: Node.js/TypeScript socket server.
- `packages/types`: Shared TypeScript interfaces.
