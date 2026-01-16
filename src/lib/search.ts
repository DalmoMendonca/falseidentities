import MiniSearch from "minisearch";
import type { FalseIdentity } from "./types";

type SearchDoc = {
  id: string;
  title: string;
  aka: string;
  tags: string;
  howItShowsUp: string;
  beliefs: string;
  behaviors: string;
  skills: string;
  truths: string;
};

export function buildSearchIndex(items: FalseIdentity[]) {
  const mini = new MiniSearch<SearchDoc>({
    fields: ["title","aka","tags","howItShowsUp","beliefs","behaviors","skills","truths"],
    storeFields: ["id","title"],
    searchOptions: { prefix: true, fuzzy: 0.2 }
  });

  const docs: SearchDoc[] = items.map(i => ({
    id: i.id,
    title: i.title,
    aka: i.aka.join(" • "),
    tags: i.tags.join(" • "),
    howItShowsUp: i.sections.howItShowsUp.join(" • "),
    beliefs: [...i.sections.beliefsAboutOthers, ...i.sections.beliefsAboutLife].join(" • "),
    behaviors: i.sections.selfReinforcingBehaviors.join(" • "),
    skills: i.sections.skillsToCultivate.join(" • "),
    truths: i.sections.deeperTruthStatements.join(" • ")
  }));

  mini.addAll(docs);
  return mini;
}
