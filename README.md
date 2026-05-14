# Launchpack

Turn messy founder notes into a Product Hunt launch kit in 60 seconds.

Launchpack is a static, open-source GitHub Pages app for makers preparing a
launch. Paste a worklog, transcript, changelog, or product brief and get:

- Product Hunt tagline and short description.
- Maker comment.
- Launch FAQ.
- X, LinkedIn, and email drafts.
- 30-second demo script.
- Launch checklist.
- Receipts that connect bold claims to source snippets.
- A ready-to-copy LLM polish prompt for optional AI refinement.
- Optional local or remote OpenAI-compatible LLM generation.
- Markdown export.

## Why Static?

The first release is designed for GitHub Pages, so it runs entirely in the
browser. There is no backend, no login, and no hidden API key. That keeps it easy
to fork, inspect, and host as an open-source project.

## Run Locally

Use any static server from the repository root:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Use A Local Or Remote LLM

Launchpack works without AI services, but you can switch `Generation mode` to
`Local / remote OpenAI-compatible LLM` and provide a model endpoint.

Supported pattern:

```text
http://localhost:1234/v1
https://your-domain.example/v1
```

The app calls:

```text
POST /chat/completions
GET /models
```

Examples:

- LM Studio: start the local server and use `http://localhost:1234/v1`.
- Ollama: use its OpenAI-compatible endpoint, commonly `http://localhost:11434/v1`.
- llama.cpp server, vLLM, LocalAI, LiteLLM, or a custom proxy: expose an
  OpenAI-compatible `/v1` endpoint.

Notes:

- The request is sent directly from the browser to the endpoint you enter.
- API keys are stored only in the current tab input, not in localStorage.
- Endpoint and model can be saved locally on your device if the checkbox is on.
- Your local or remote server must allow browser CORS requests from the Pages
  domain.
- If the LLM call fails, Launchpack falls back to deterministic local generation.

## Deploy To GitHub Pages

1. Push this repository to GitHub.
2. Open repository `Settings -> Pages`.
3. Set `Source` to `Deploy from a branch`.
4. Select the branch with these files and folder `/root`.
5. Save and wait for the Pages URL.

## Project Structure

```text
.
├── index.html
├── styles.css
├── app.js
├── generator.js
├── PRODUCT_PLAN.md
├── research/product-hunt-kb/
└── .nojekyll
```

## Roadmap

- Saved local launch kits.
- GitHub release notes importer.
- Landing page preview.
- Shareable compressed permalink.

## License

MIT
