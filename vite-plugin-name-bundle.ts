import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';

interface SourceConfig {
  tags: Record<string, string[]>;
}

export interface NameRecord {
  name: string;
  tags: Record<string, string[]>;
}

function readNames(filePath: string): string[] {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (Array.isArray(data)) {
    return data;
  }
  for (const value of Object.values(data)) {
    if (Array.isArray(value)) {
      return value as string[];
    }
  }
  return [];
}

export function loadNameData(
  root = path.dirname(fileURLToPath(import.meta.url)),
  sources?: Record<string, SourceConfig>,
) {
  const corporaRoot = path.join(root, 'third_party', 'corpora', 'data');
  const srcs: Record<string, SourceConfig> =
    sources ?? JSON.parse(fs.readFileSync(path.join(root, 'name-sources.json'), 'utf-8'));

  const records: NameRecord[] = [];
  const tagIndex: Record<string, Set<string>> = {};

  for (const [rel, { tags }] of Object.entries(srcs)) {
    const filePath = path.join(corporaRoot, rel);
    const names = readNames(filePath);
    for (const name of names) {
      const entryTags: Record<string, string[]> = {};
      for (const [key, values] of Object.entries(tags)) {
        entryTags[key] = [...values];
        const set = tagIndex[key] ??= new Set();
        for (const v of values) set.add(v);
      }
      records.push({ name, tags: entryTags });
    }
  }

  const indexObj = Object.fromEntries(
    Object.entries(tagIndex).map(([k, v]) => [k, Array.from(v).sort()]),
  );

  return { records, tagIndex: indexObj };
}

export default function nameBundlePlugin(): Plugin {
  let outDir = '';

  return {
    name: 'name-bundle',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async buildStart() {
      const root = path.dirname(fileURLToPath(import.meta.url));
      const configPath = path.join(root, 'name-sources.json');
      this.addWatchFile(configPath);
      const sources: Record<string, SourceConfig> = JSON.parse(
        fs.readFileSync(configPath, 'utf-8'),
      );
      const corporaRoot = path.join(root, 'third_party', 'corpora', 'data');
      for (const rel of Object.keys(sources)) {
        this.addWatchFile(path.join(corporaRoot, rel));
      }

      const { records, tagIndex } = loadNameData(root, sources);

      const genDir = path.join(outDir, 'generated');
      fs.mkdirSync(genDir, { recursive: true });
      const namesModule = `export interface NameRecord { name: string; tags: Record<string, string[]> }\nexport const names: NameRecord[] = ${JSON.stringify(records, null, 2)};\n`;
      fs.writeFileSync(path.join(genDir, 'names.js'), namesModule);

      const indexModule = `export const tagIndex: Record<string, string[]> = ${JSON.stringify(tagIndex, null, 2)};\n`;
      fs.writeFileSync(path.join(genDir, 'tagIndex.js'), indexModule);
    },
  };
}
