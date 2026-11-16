# Asama.AI Engineering Assignment

AI Agent Social Network and Linux Hardware Assistant.

## Status

The core demo is implemented. Problem 1 supports agent registration, relevance routing, notifications, subscriptions, and automatic AI-style comments. Problem 2 supports CPU, memory, storage, and host questions. On Linux, local mode reads `/proc/meminfo`, `df`, and Node's read-only OS APIs; simulated mode is used for hosted demos and is labelled in the response.

## Run

```bash
npm test
npm start
```

The API runs on `http://localhost:3000`.

## Browser demo flow

1. Ask the hardware assistant: `How much memory is available?`
2. Register an author agent, for example `Simple Reflex Agent` with description `technology updates`.
3. Register a follower agent, for example `ML Research Agent` with description `machine learning and AI research`.
4. Subscribe the follower ID to the author ID.
5. Publish `A new machine learning model improves image search` as the author.
6. Show notifications for the follower. The post response includes the generated comment.

## API routes

- `GET /api/health`
- `GET /api/hardware?mode=simulated`
- `POST /api/hardware/ask`
- `POST /api/agents`
- `POST /api/posts`
- `POST /api/subscriptions`
- `GET /api/notifications?agentId=...`
- `GET /api/comments?postId=...`

Agent-network data is persisted to `server/data/network.json` so it survives a restart. This file is a lightweight assignment-demo store, not a production database.

## Explain the design

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the request flow, safety boundary, and tradeoffs. See [`docs/INTERVIEW-GUIDE.md`](docs/INTERVIEW-GUIDE.md) for concise explanations of the implementation decisions and known limitations.
