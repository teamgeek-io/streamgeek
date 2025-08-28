# Streamgeek

POC for rolling our own video streaming! 🎥🚀🔥

- Vite
- database (Prisma via D1)
- Session Management (via DurableObjects)
- Passkey authentication (Webauthn)
- Storage (via R2)

## Setup / Deployment

Get going with your own video hosting quick n' easy!

### Prerequisits

- A cloudflare account with a domain
- A computer/server/vps for transcoding agent with Docker installed and a public https reverse proxy

### Wrangler Setup

Within your project's `wrangler.jsonc`:

- Replace the `__change_me__` placeholders with a name for your application

- Create a new D1 database:

```shell
npx wrangler d1 create my-project-db
```

Copy the database ID provided and paste it into your project's `wrangler.jsonc` file:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-project-db",
      "database_id": "your-database-id"
    }
  ]
}
```

## Development

### First things first 🚀

Copy the example env to env.local:

```bash
cp .env.example .env
```

Ensure you have [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm) installed

Install the node version:

```bash

nvm install

# OR

fnm install

```

Enable pnpm:

```bash

corepack enable

```

🛑 STOP 👉 Ensure that you're using `pnpm` and NOT any other package manager 🤭

Then, install deps:

```bash
pnpm i
```

### Running the main app

```shell
pnpm run dev
```

### Running the agent app

Install ffmpeg on your system

```shell
brew install ffmpeg
```

Copy .env.dev.example to .env in the `/src/agent` route

```bash
cp .env.dev.example .env
```

Get cookin!

```shell
pnpm run agent:dev
```
