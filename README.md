# OpenRoll

## What is OpenRoll?

OpenRoll is a browser-based companion for tabletop role-playing games. It
adds dice rolling, conditional text, inventories, character sheets, and other
utilities to help run sessions at the table or online.

## Key Features

- Interactive OML tags for dice rolls and conditional content.
- Character generator for creating new heroes quickly.
- Inventory management with drag and drop.
- Persistent notes and character sheets.

## Architecture

OpenRoll is built with React and TypeScript, bundled by Vite. Game state is
stored using Zustand to keep the UI responsive and predictable.

## Development

Install dependencies and start a local development server:

```bash
npm run update
npm run dev
```

## Build

For continuous integration or production builds:

```bash
npm run ci-update
npm run build
```
