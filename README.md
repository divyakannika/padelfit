# PadelFit

A padel racket recommender that figures out your game through conversation and suggests the right racket for you. 
Built with **Vue 3**, **Node.js/TypeScript**, and **Ollama (llama3.2)** running locally.

## How it works

The app isn't just a basic form. It runs a conversation to collect four key data points:
1.  **Skill level**
2.  **Play style**
3.  **Physical stats** (Height/Weight)
4.  **Budget**

### The Prompt Split
I handled the conversation and the matching as two separate prompts. 
* **The Coach (Conversation):** This keeps the LLM in "coach mode" so it asks questions naturally and only outputs a structured profile once it has everything it needs. 
* **The Matcher:** This is stateless. It takes that profile and the racket catalogue and returns ranked JSON. 

Splitting them this way keeps the context window tiny and makes the output way more predictable than trying to do it all in one massive thread.

## Setup

**Prerequisites:** Node.js 18+ and [Ollama](https://ollama.com/) installed.

```bash
ollama pull llama3.2
```

**Backend**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

## Running tests

```bash
cd backend
npm test
```

## Structure
The backend follows a layered architecture so each part can be swapped independently.

* **Domain:** The core models. No external dependencies.
* **Application:** The use cases (`startConversation`, `sendMessage`, `getRecommendations`). 
* **Infrastructure:** The concrete stuff—Ollama adapter, in-memory store, and the racket catalogue.
* **Presentation:** Express controllers that just translate HTTP into use case calls.

**Why?** Because if I want to swap Ollama for OpenAI or move the catalogue to a real database, I just implement a new adapter in the Infrastructure layer and change one line in `app.ts`.

## Trade-offs and Limitations

- **In-memory store**: fast and simple for a prototype. Nothing survives a server restart but the interface is in place to swap in a database.
- **No state management**: all state lives in `ChatWindow.vue` because there is only one stateful view. Pinia would have been unnecessary complexity at this scope.
- **Environment config**: sensitive config like the Ollama URL and model name are kept in `.env` which is gitignored. A `.env.example` is committed with placeholder values so anyone cloning the repo knows exactly what to set up without exposing real config.
- **No auth or session management**: conversations are stored with a UUID as the only identifier so anyone who knows a conversation ID can access it.
- **Sparse catalogue**: 10 rackets means coverage is thin for certain combinations like low budget power players. The app handles fewer than 3 matches gracefully in the UI but the underlying data gap is still a real limitation.
- **LLM consistency**: llama3.2 occasionally summarises before outputting the profile JSON or interprets ambiguous answers differently across runs. The app handles this reasonably well but edge cases exist.
- **No guardrails or governance**: user messages go directly to the LLM without validation or filtering, leaving the pipeline open to prompt injection and inappropriate content. There is no content moderation on the output side either. In production a sanitisation layer before the LLM and moderation middleware on the response would be the minimum bar.
- **No frontend tests**: the backend use cases are covered but the Vue components are not. Vitest and Vue Test Utils would be the next step.

## Data

Racket profiles were sourced manually from padelful.com reviews. The `RacketRepository` interface is already in place so this can be swapped for a live API adapter without touching the use cases.

## The Challenges (and how I solved them)

- **LLM output parsing** llama3.2 occasionally wraps JSON in markdown or cuts off the closing brace. Fixed with defensive parsing: strip markdown fences, extract the JSON block with regex, and pre-filter the catalogue by budget so the model cannot recommend out-of-budget rackets regardless of what it outputs.
- **Model selection** llama3 was too slow on CPU and phi3 leaked the system prompt. llama3.2 was the right balance of speed and instruction-following for local development.
- **CommonJS compatibility** uuid v13 is ESM-only which breaks Jest in CommonJS mode. Downgrading to v9 fixed it without any config changes.
- **Conversation feel** early prompts felt like a survey. Removing scripted question wording and telling the LLM to behave like a real coach made the conversation feel natural immediately.

## What's next

- **Persistence**: swap the in-memory store for a Postgres or Redis adapter. The `ConversationStore` interface is already in place so the use cases stay untouched.
- **Auth**: conversations stored against a user ID with JWT handling sessions. Needed before this is exposed to real users.
- **Guardrails and governance**: a validation layer before messages hit the LLM, content moderation on the output side, child safe and rate limiting on the API endpoints.
- **Live catalogue**: replace the static data with a `PadelfulApiAdapter`. The `RacketRepository` interface is ready for it.
- **Production LLM**: swap Ollama for a hosted provider via the `LLMAdapter` interface. Structured outputs or function calling would also replace the current regex JSON parsing.
- **Catalogue data pipeline**: scrape and normalise racket data from multiple sources like manufacturer sites, retailer listings, and review sites. Each source would have its own adapter normalising into the same `Racket` interface without changing anything in the use cases.
- **Richer user profile**: add playing frequency, injury history, preferred grip size, whether the player competes or plays recreationally, and racket feel preference (soft, medium, or hard). The conversation prompt and `UserProfile` interface are the only two places that would need to change.
- **Start over button**: state reset on the frontend, no backend changes needed.
- **Racket comparison**: checkbox on each card, side by side view when two are selected.
- **Recommendation feedback**: thumbs up/down per card, new POST endpoint, data feeds back into prompt tuning over time.
- **Multiple languages**: pass the user's language into the system prompt, the LLM handles the rest.
