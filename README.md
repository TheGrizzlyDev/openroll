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
- Animated 3D dice rolls with customizable appearance.

## Playwright E2E with Nix

If you have Nix installed, you can use the provided flake to run Playwright
tests with the browser binaries supplied by Nix (no downloads required).

```bash
nix develop
npm install
npm run test:e2e
```
