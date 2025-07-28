# Streamgeek

POC for rolling our own video streaming! 🎥🚀🔥

## Anatomy

### app

Cloudflare workers app that provides a UI and agent orchestrator

### agent

Node.js docker app that lives on your hardware for cheap transcoding

## Getting Started

Get the right node version, enable corepack and install deps.

```
nvm install
corepack enable
pnpm i
```

```bash
pnpm i
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 👨‍🍳
