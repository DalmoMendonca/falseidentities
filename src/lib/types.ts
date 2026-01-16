export type FalseIdentitySections = {
  howItShowsUp: string[];
  effectOnOthers: string[];
  beliefsAboutOthers: string[];
  beliefsAboutLife: string[];
  selfReinforcingBehaviors: string[];
  skillsToCultivate: string[];
  gifts: string[];
  deeperTruthStatements: string[];
};

export type FalseIdentity = {
  id: string;
  title: string;
  aka: string[];
  trueIdentity: string;
  sections: FalseIdentitySections;
  tags: string[];
  relatedIds: string[];
  sources?: { pdfPageStart?: number; pdfPageEnd?: number };
  authoring: { licenseStatus: "licensed" | "paraphrased" | "userNotesOnly"; lastUpdated: string };
};

export type Dataset = {
  version: string;
  falseIdentities: FalseIdentity[];
};
