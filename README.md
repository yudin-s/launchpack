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

- Optional OpenAI-compatible proxy mode.
- Saved local launch kits.
- GitHub release notes importer.
- Landing page preview.
- Shareable compressed permalink.

## License

MIT
