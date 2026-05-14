# Launchpack Product Plan

## Product Thesis

Product Hunt makers do not fail because they lack a product. They fail because
their launch story is trapped in messy notes, changelogs, meeting transcripts,
and half-written posts. Launchpack turns that raw work into a launch room:
positioning, Product Hunt copy, social posts, FAQ, demo script, checklist, and
claim receipts.

## Audience

- Indie makers preparing a Product Hunt launch.
- Devtool founders shipping open-source projects.
- Solo builders who have product context but no time for launch copy.
- Coding-agent users who want a clean markdown handoff for launch materials.

## Core Job

When I paste my messy worklog, help me extract the strongest launch story and
ship a credible launch pack without starting from a blank page.

## MVP

- Static GitHub Pages app.
- Text input for worklog, notes, transcript, changelog, or commits.
- Optional product name, audience, and tone fields.
- Local deterministic generation with no backend dependency.
- Product Hunt section: tagline, short description, maker comment, demo script.
- Social section: X post, LinkedIn post, email.
- FAQ and launch checklist.
- Receipts linking major claims to source snippets.
- AI polish prompt for optional external refinement without sending data by default.
- Markdown export.

## Non-Goals For Version 1

- Product Hunt API posting.
- Account system.
- Multi-user workspace.
- Server-side AI inference.
- Browser automation.
- Video generation.
- Billing.

## GitHub Pages Architecture

- `index.html`: static shell and product UI.
- `styles.css`: responsive visual system.
- `generator.js`: deterministic local launch-kit generator.
- `app.js`: browser interactions, tabs, copy, export.
- `.nojekyll`: ensures GitHub Pages serves files as-is.

## Future Versions

- Optional OpenAI-compatible proxy endpoint for higher-quality copy.
- Competitor comparison input.
- Landing page hero preview.
- Saved local launch kits via IndexedDB.
- Import from `git log`, GitHub release notes, or markdown files.
- Shareable permalink using compressed local state.
