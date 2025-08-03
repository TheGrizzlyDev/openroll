# OpenRoll

## Development

```bash
npm run update
npm run dev
```

## Build

```bash
npm run ci-update
npm run build
```

## Generated name data

`vite-plugin-name-bundle.ts` collects name corpora and writes
`dist/generated/names.json` and `dist/generated/tagIndex.json`. These files are
created automatically during `npm run dev` and `npm run build` and should not be
edited by hand.
