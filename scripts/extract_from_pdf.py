# Licensed extractor for Feminine Power — False Identities app
#
# This script extracts the PDF at content/source.pdf and populates content/false_identities.json.
#
# Usage:
#   1) Place PDF at content/source.pdf
#   2) python scripts/extract_from_pdf.py
#
from pathlib import Path
import json, re
import pdfplumber

PDF_PATH = Path("content/source.pdf")
OUT_PATH = Path("content/false_identities.json")

heading_specs = [
    ("howItShowsUp", r"You may:\s*\(how it shows up in your life\)"),
    ("effectOnOthers", r"Others often:\s*\(effect on others\)"),
    ("beliefsAboutOthers", r"Beliefs about others:"),
    ("beliefsAboutLife", r"Belief about life:"),
    ("selfReinforcingBehaviors", r"You may:\s*\(ways of being that generate evidence that validate identity\)"),
    ("skillsToCultivate", r"Skills(?:\s+and\s+capacities)?\s+to\s+cultivate.*?:"),
    ("gifts", r"Gifts:"),
    ("deeperTruthStatements", r"Deeper Truth Statements:"),
    ("trueIdentity", r"True Identity:")
]

def clean_text(t: str)->str:
    t = t.replace("", "•").replace("\uf09f", "•")
    t = re.sub(r"Copyright Feminine Power 2006\s+\d+\s*", "", t)
    t = re.sub(r"This document may not be reproduced.*?authors\.\s*", "", t, flags=re.IGNORECASE)
    t = re.sub(r"Info@FemiminePower\.com\s*", "", t, flags=re.IGNORECASE)
    t = re.sub(r"^\s*\d+\s*$", "", t, flags=re.MULTILINE)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()

def parse_bullets(block: str):
    lines = [ln.rstrip() for ln in block.splitlines()]
    items=[]
    cur=[]
    bullet_open=False
    for ln in lines:
        s = ln.strip()
        if not s:
            continue
        if s == "•":
            if cur:
                items.append(" ".join(cur).strip())
                cur=[]
            bullet_open=True
            continue
        if s.startswith("•"):
            if cur:
                items.append(" ".join(cur).strip())
            cur=[s.lstrip("•").strip()]
            bullet_open=True
            continue
        if bullet_open:
            cur.append(s)
        else:
            cur.append(s)
    if cur:
        items.append(" ".join(cur).strip())
    return [re.sub(r"\s+", " ", it).strip() for it in items if it.strip()]

def split_sections(text: str):
    hits=[]
    for key, rx in heading_specs:
        for m in re.finditer(rx, text, flags=re.IGNORECASE):
            hits.append((m.start(), m.end(), key))
    hits.sort(key=lambda x: x[0])
    sections={}
    for i, (start, end, key) in enumerate(hits):
        nxt = hits[i+1][0] if i+1 < len(hits) else len(text)
        sections[key]=text[end:nxt].strip()
    return sections

def main():
    if not PDF_PATH.exists():
        raise SystemExit("Missing content/source.pdf")

    with pdfplumber.open(str(PDF_PATH)) as pdf:
        toc_text = pdf.pages[1].extract_text() or ""
        toc_entries=[]
        for ln in [x.strip() for x in toc_text.splitlines()]:
            if ln.startswith("I"):
                m = re.match(r"^(?P<title>.+?)\s+(?:[\.…\s]+)\s*(?P<page>\d+)$", ln)
                if m:
                    toc_entries.append((m.group('title').strip(), int(m.group('page'))))

        dataset = {
            "version":"0.1.0",
            "falseIdentities":[]
        }

        for idx, (title, start_page) in enumerate(toc_entries):
            end_page = (toc_entries[idx+1][1]-1) if idx+1 < len(toc_entries) else len(pdf.pages)
            raw="\n\n".join((pdf.pages[p].extract_text() or "") for p in range(start_page-1, end_page))
            text=clean_text(raw)
            lines=[ln.strip() for ln in text.splitlines() if ln.strip()]
            aka=[]
            if len(lines)>1 and lines[1].lower().startswith("(a.k.a."):
                aka_line=lines[1].strip("()")
                aka_inner=aka_line.replace("a.k.a.","").replace("A.K.A.","").strip()
                aka=[x.strip() for x in re.split(r",|/|;| and ", aka_inner) if x.strip()]

            sections_raw=split_sections(text)
            rec={
                "id": "",
                "title": title,
                "aka": aka,
                "trueIdentity": re.sub(r"\s+"," ",sections_raw.get("trueIdentity","")).strip(),
                "sections": {
                    "howItShowsUp": parse_bullets(sections_raw.get("howItShowsUp","")),
                    "effectOnOthers": parse_bullets(sections_raw.get("effectOnOthers","")),
                    "beliefsAboutOthers": parse_bullets(sections_raw.get("beliefsAboutOthers","")),
                    "beliefsAboutLife": parse_bullets(sections_raw.get("beliefsAboutLife","")),
                    "selfReinforcingBehaviors": parse_bullets(sections_raw.get("selfReinforcingBehaviors","")),
                    "skillsToCultivate": parse_bullets(sections_raw.get("skillsToCultivate","")),
                    "gifts": parse_bullets(sections_raw.get("gifts","")),
                    "deeperTruthStatements": parse_bullets(sections_raw.get("deeperTruthStatements",""))
                },
                "tags": [],
                "relatedIds": [],
                "sources": {"pdfPageStart": start_page, "pdfPageEnd": end_page},
                "authoring": {"licenseStatus":"licensed","lastUpdated":"2026-01-14"}
            }
            dataset["falseIdentities"].append(rec)

    OUT_PATH.write_text(json.dumps(dataset, indent=2, ensure_ascii=False), encoding="utf-8")
    print("Wrote", OUT_PATH)

if __name__ == "__main__":
    main()
