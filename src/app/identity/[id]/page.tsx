import { getIdentity } from "@/lib/data";

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="section">
      <div className="sectionTitle">{title}</div>
      <ul className="sectionList">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}

export default function IdentityPage({ params }: { params: { id: string } }) {
  const item = getIdentity(params.id);
  if (!item) return <div className="card"><h1 className="h1">Not found</h1></div>;

  const aka = item.aka?.filter(Boolean) ?? [];
  const trueIdentity = item.trueIdentity?.trim();
  const sections = [
    { title: "How it shows up (You may...)", items: item.sections.howItShowsUp },
    { title: "Effect on others (Others may...)", items: item.sections.effectOnOthers },
    { title: "Beliefs about others", items: item.sections.beliefsAboutOthers },
    { title: "Beliefs about life", items: item.sections.beliefsAboutLife },
    { title: "Self-reinforcing behaviors (You may...)", items: item.sections.selfReinforcingBehaviors },
    { title: "Skills to cultivate", items: item.sections.skillsToCultivate },
    { title: "Gifts", items: item.sections.gifts },
    { title: "Deeper truth statements", items: item.sections.deeperTruthStatements }
  ].filter(section => section.items?.length);

  return (
    <div className="card">
      <div className="cardHeader">
        <h1 className="h1">
          {item.title}
          {aka.length ? <span className="titleAka"> ({aka.join(" / ")})</span> : null}
        </h1>
      </div>

      {(item.tags || []).length ? (
        <div className="row tagRow">
          {(item.tags || []).map(t => <span key={t} className="chip">{t}</span>)}
        </div>
      ) : null}

      {trueIdentity ? (
        <div className="trueIdentity">
          <div className="trueIdentityTitle">True identity</div>
          <div className="trueIdentityText">{trueIdentity}</div>
        </div>
      ) : null}

      {sections.length ? (
        <div className="sectionGrid">
          {sections.map(section => (
            <Section key={section.title} title={section.title} items={section.items} />
          ))}
        </div>
      ) : null}

      <div style={{ marginTop: 16 }} className="row">
        <a className="btn secondary" href="/#library">Back to library</a>
        <a className="btn" href="/#exercise">Uncover your false identity</a>
      </div>
    </div>
  );
}
