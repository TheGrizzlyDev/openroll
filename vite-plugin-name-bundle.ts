import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';
import type {
  NameRecord,
  SourcesConfig,
  TagIndex,
} from './src/name_service/types';

function readNames(filePath: string): string[] {
  if (!fs.existsSync(filePath)) return [];
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
  sources?: SourcesConfig,
) {
  const corporaRoot = path.join(root, 'third_party', 'corpora', 'data');
  const srcs: SourcesConfig =
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

  const indexObj: TagIndex = Object.fromEntries(
    Object.entries(tagIndex).map(([k, v]) => [k, Array.from(v).sort()]),
  );

  return { records, tagIndex: indexObj };
}

export default function nameBundlePlugin(): Plugin {
  return {
    name: 'name-bundle',
    async buildStart() {
      const root = path.dirname(fileURLToPath(import.meta.url));
      const configPath = path.join(root, 'name-sources.json');
      this.addWatchFile(configPath);
      const sources: SourcesConfig = JSON.parse(
        fs.readFileSync(configPath, 'utf-8'),
      );
      const corporaRoot = path.join(root, 'third_party', 'corpora', 'data');
      for (const rel of Object.keys(sources)) {
        const abs = path.join(corporaRoot, rel);
        if (fs.existsSync(abs)) this.addWatchFile(abs);
      }

      const { records, tagIndex } = loadNameData(root, sources);

      const genDir = path.join(root, 'dist', 'generated');
      fs.mkdirSync(genDir, { recursive: true });
      fs.writeFileSync(
        path.join(genDir, 'names.json'),
        JSON.stringify(records, null, 2),
      );
      fs.writeFileSync(
        path.join(genDir, 'tagIndex.json'),
        JSON.stringify(tagIndex, null, 2),
      );
    },
  };
}
