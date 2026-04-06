# Architecture Guide

Testbed is intentionally a local-first application. The website, desktop shell, runtime state, and APIs all run on the same machine so learners can inspect and manipulate a realistic environment without external dependencies.

## Frontend Boundaries

The React frontend is split by product surface rather than by framework layer alone.

- shared primitives live in `src/components`
- learning content utilities and parsing live in `src/content`
- cross-cutting hooks live in `src/hooks`
- data helpers and browser storage live in `src/lib`
- route-facing page UI stays in `src/App.tsx` for now, but shared logic should continue to move into feature areas rather than back into the root file

The browser app and desktop shell share tokens, utilities, and some presentational pieces, but they should not share incidental state.

## Server Boundaries

The server is still a single local HTTP process, but it is no longer meant to be one giant route file.

- `server/create-server.mjs`: server startup and top-level request flow
- `server/http-helpers.mjs`: JSON/raw/file helpers and common request utilities
- `server/route-registry.mjs`: route metadata used by matching and Postman generation
- `server/postman.mjs`: collection and environment generation
- `server/auth.mjs`: Bearer token parsing and admin auth enforcement
- `server/faults.mjs`: backward-compatible fault mapping and payload mutation
- `server/runtime-data.mjs`: runtime JSON creation, reading, and mutation

The route registry is the shared source of truth for:

- endpoint identification
- trace labeling
- route matching
- request/response examples in generated Postman assets

## Desktop Bridge

Electron owns:

- choosing and reopening the data folder
- starting the local server
- exposing desktop context into the renderer
- opening the chosen data directory from the shell

The React layer should treat the desktop bridge as a thin integration seam, not as a place to move product logic.

## Runtime Ownership

Defaults under `src/config` and `src/data` are immutable source assets. Runtime JSON under the chosen data folder is mutable learner state. Server-side code owns reading and writing runtime files. Frontend code should request mutations through HTTP or the desktop bridge rather than inventing alternate state paths.
