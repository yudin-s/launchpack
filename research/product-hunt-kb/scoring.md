# Scoring Model

Question: which Product Hunt-style project has the strongest response potential
and is realistic for Codex to build in two 5-hour windows?

## Criteria

Score each criterion from 1 to 5.

- Impact: the pain and value are obvious from the first screen.
- Novelty: a fresh angle, not just another generic AI wrapper.
- Implementation: can be built end-to-end in about 10 hours.
- Risk: technical/API/data/moderation risk. Higher is worse.
- Demoability: clear 30-60 second before/after demo.

## Formula

`Total = 0.25*Impact + 0.20*Novelty + 0.25*Implementation + 0.15*(6-Risk) + 0.15*Demoability`

## Interpretation

- 4.2-5.0: strong one-day candidate.
- 3.5-4.1: possible with a very sharp scope.
- Below 3.5: too risky or too vague for this build window.
