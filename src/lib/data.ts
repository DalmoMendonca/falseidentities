import dataset from "@/content/false_identities.json";
import type { Dataset, FalseIdentity } from "./types";

export const DATASET = dataset as Dataset;

export function getIdentity(id: string): FalseIdentity | undefined {
  return DATASET.falseIdentities.find(x => x.id === id);
}

export function allTags(): string[] {
  const s = new Set<string>();
  for (const i of DATASET.falseIdentities) for (const t of i.tags) s.add(t);
  return Array.from(s).sort((a, b) => {
    const aKey = a.toLowerCase();
    const bKey = b.toLowerCase();
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
  });
}
