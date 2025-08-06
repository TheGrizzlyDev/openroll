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

## OML tags

OpenRoll embeds interactive elements in text using lightweight tags.
Tags use the syntax `[tag "description" ...]` where the first quoted
argument becomes the visible label. For example:

```
[dice "fire" 2d6+3 kind=burn]
```

renders a badge labelled "fire" that rolls `2d6+3` when clicked.

Conditional sections use `[if]`, optional `[elif]`/`[else]` branches,
and must be closed with `[fi]`.
