# URL Shortener

A simple URL shortener with Redis leaderboard and browser UI.

## Run locally with Docker

1. Build and start services:

```bash
docker compose up --build
```

2. Open in your browser:

```text
http://localhost:3000
```

## Deploy online

On a public server, run the same compose stack and ensure port `3000` is open in the firewall.

```bash
docker compose up --build -d
```

Then access the app at:

```text
http://<your-server-ip>:3000
```

## Notes

- Server now binds to `0.0.0.0`, so it accepts external connections.
- `docker-compose.yml` publishes port `3000` and restarts containers automatically.
- Use `.env.example` as a template for environment variables if you want a local `.env`.
