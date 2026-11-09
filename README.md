# TRX Workout Builder

A single-page web app that builds personalised training programs for personal-training clients. Built by a canfitpro-certified trainer for her own daily work at TRX Flow.Her (Toronto).

## What it does

- Generates a session in seconds from client goal, level, duration, available equipment (TRX, dumbbells, bands, bodyweight) and restrictions (knees, shoulders, wrists, lower back, neck, pelvic floor).
- Library of 299 exercises, each with a technical name and a plain-language explanation in four languages (Russian, Ukrainian, French, English).
- Session focus: full body, legs and abs, or upper body.
- Block styles for variety: circuit, ladder (reps grow every round) and right side first then left.
- Workout log: remembers recent sessions and avoids repeating exercises and block styles, so clients cannot predict the next session.
- Client programs saved in the browser, export to text, JSON backup and restore.

## How it works

- Seeded pseudo-random generator (mulberry32) with weighted selection by level, equipment and recency.
- Filtering by equipment, level and contraindications before any pick.
- Plain HTML, CSS and JavaScript. No framework, no build step, no server. Data stays in the browser (localStorage).

## Run it

Open `index.html` in a browser. The files in `src/` are the readable sources that are inlined into `index.html`.

## Structure

- `src/logic.js` exercise data, generator, text export
- `src/ui.js` interface and storage
- `src/i18n.js`, `src/i18n_desc.js` translations and exercise descriptions
- `src/style.css` design

## Author

Alina Bondarenko, personal trainer, Toronto.
