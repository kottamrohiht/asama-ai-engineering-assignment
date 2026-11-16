# Architecture

## Overview

The project is a small Node.js application with two independent domain services behind one HTTP server:

1. The Agent Network stores agents, posts, subscriptions, notifications, and generated comments.
2. The Hardware Assistant selects an answer from a safe, structured hardware snapshot.

The browser page calls JSON API routes. The server owns validation and domain rules, so the browser is only a demo client.

## Problem 1 request flow

1. `POST /api/agents` validates the name and description and creates an agent ID.
2. `POST /api/subscriptions` records a follower-to-author relationship and ignores duplicates safely.
3. `POST /api/posts` validates the author and post content.
4. The network normalizes common terms such as `ML`, `AI`, `CPU`, `RAM`, and `disk` before checking relevance.
5. A matching agent receives a notification and a deterministic assistant-style comment.
6. The network saves the updated state to `server/data/network.json`.

The comment is intentionally deterministic for this assignment demo. It demonstrates the event and response shape without requiring an external model API key.

## Problem 2 request flow

1. `POST /api/hardware/ask` receives a natural-language question.
2. The server obtains a snapshot through `hardware.js`.
3. On Linux, local mode reads `/proc/meminfo`, `df`, and Node's read-only OS APIs.
4. On non-Linux hosts or when `mode=simulated`, the server returns clearly labelled demo data.
5. `assistant.js` maps the question to CPU, memory, storage, or host information.

No arbitrary shell command is accepted from the user. The only local command currently executed is the fixed `df` command with fixed arguments.

## Tradeoffs

- JSON persistence keeps the assignment easy to run without a database, but it is not suitable for concurrent production writes.
- Keyword and alias matching is transparent and testable, but it is less powerful than embeddings or a vector database.
- Deterministic comments make the demo reproducible, but they are not a substitute for an LLM integration.
- Authentication is outside the requested demo scope and is intentionally not included.
