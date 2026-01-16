"use client";

import { useEffect, useMemo, useState } from "react";
import { DATASET, allTags } from "@/lib/data";
import { buildSearchIndex } from "@/lib/search";

type Suggestion = { identityId: string; title: string; reason: string };

const STEPS = [
  {
    key: "complaint",
    title: "1. State your complaint",
    question: "State your complaint (something that triggered you) about your spouse.",
    helper: "Recurring or one major event. Keep it short and concrete; do not read examples to your spouse.",
    example: "You are always creating distance between us.",
    placeholder: "Name the trigger without the full story."
  },
  {
    key: "reaction",
    title: "2. State your primary emotional reaction",
    question: "State your primary emotional reaction (usually fight, flight, or freeze).",
    helper: "State a feeling, not an interpretation. Common options: anger, hurt, disgust, shame, fear.",
    example: "I feel angry, hurt, or confused.",
    placeholder: "Anger, hurt, disgust, shame, fear."
  },
  {
    key: "vulnerableFeeling",
    title: "3. State the vulnerable feeling below your reaction",
    question: "State the vulnerable feeling below your reaction.",
    helper: "This is what the primary reaction is protecting. Feel into body and breath; ask how a child might feel.",
    example: "I feel sad and alone.",
    placeholder: "Name the tender feeling."
  },
  {
    key: "belief",
    title: "4. State the belief about yourself",
    question: "State the belief about yourself that underlies your vulnerable feeling.",
    helper: "Keep it simple and direct. Make it about you.",
    example: "I believe you do not care for me.",
    placeholder: "What do you believe about you?"
  },
  {
    key: "fear",
    title: "5. Recognize your deepest fear",
    question: "Recognize your deepest fear.",
    helper: "This is the core fear beneath the belief.",
    example: "My deepest fear is that I am not worth loving.",
    placeholder: "Name the fear."
  },
  {
    key: "falseIdentity",
    title: "6. State your false identity",
    question: "Choose the false identity that fits best.",
    helper: "The AI suggests up to three identities based on your answers.",
    example: "",
    placeholder: ""
  }
] as const;
type StepKey = (typeof STEPS)[number]["key"];
const STORAGE_KEY = "false-identities.exercise.v1";
const EMPTY_ANSWERS: Record<StepKey, string> = {
  complaint: "",
  reaction: "",
  vulnerableFeeling: "",
  belief: "",
  fear: "",
  falseIdentity: ""
};

export default function Home() {
  const tags = useMemo(() => allTags(), []);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("");

  const [answers, setAnswers] = useState<Record<StepKey, string>>({ ...EMPTY_ANSWERS });
  const [stepIndex, setStepIndex] = useState(0);
  const [guidance, setGuidance] = useState("");
  const [hintBullets, setHintBullets] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [hintStatus, setHintStatus] = useState<"idle" | "loading" | "ready">("idle");

  const index = useMemo(() => buildSearchIndex(DATASET.falseIdentities), []);
  const results = useMemo(() => {
    const items = DATASET.falseIdentities;
    const filtered = tag ? items.filter(i => i.tags.includes(tag)) : items;
    if (!q.trim()) return filtered.map(i => ({ id: i.id, title: i.title }));
    return index
      .search(q)
      .map(r => ({ id: (r as any).id as string, title: (r as any).title as string }))
      .filter(r => filtered.some(i => i.id === r.id));
  }, [q, tag, index]);

  const step = STEPS[Math.min(stepIndex, STEPS.length - 1)];
  const isChoiceStep = step.key === "falseIdentity";
  const currentValue = answers[step.key];
  const canContinue = Boolean(currentValue.trim()) && !busy;
  const isComplete = Boolean(answers.falseIdentity);
  const hasProgress =
    stepIndex > 0 || Object.values(answers).some(value => value.trim().length > 0);
  const isThinking = hintStatus === "loading";

  const inputSection = (
    <div className="inputBlock">
      {!isChoiceStep ? (
        <>
          <textarea
            value={currentValue}
            onChange={e => handleChange(e.target.value)}
            placeholder={step.placeholder}
          />
          <div className="row">
            <button className="btn" onClick={handleContinue} disabled={!canContinue}>
              {busy ? "Thinking..." : "Continue"}
            </button>
          </div>
          {error ? <div className="error">{error}</div> : null}
        </>
      ) : (
        <>
          <div className="choiceGrid">
            {suggestions.length ? suggestions.map(choice => (
              <button
                key={choice.identityId}
                className={
                  "choiceButton" + (answers.falseIdentity === choice.identityId ? " selected" : "")
                }
                onClick={() => handleSelect(choice)}
              >
                <span className="choiceTitle">{choice.title}</span>
                <span className="choiceReason">{choice.reason}</span>
              </button>
            )) : (
              <div className="small">No suggestions yet. Complete the previous step to continue.</div>
            )}
          </div>

          {answers.falseIdentity ? (
            <div className="completion card inset">
              <div className="sectionTitle">Your false identity</div>
              <div className="itemTitle">{selectedTitle || "Selection saved"}</div>
              <div className="row" style={{ marginTop: 10 }}>
                <a className="btn" href={`/identity/${answers.falseIdentity}`}>
                  View identity profile
                </a>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const storedAnswers = parsed?.answers ?? {};
        const nextAnswers = {
          complaint: typeof storedAnswers.complaint === "string" ? storedAnswers.complaint : "",
          reaction: typeof storedAnswers.reaction === "string" ? storedAnswers.reaction : "",
          vulnerableFeeling: typeof storedAnswers.vulnerableFeeling === "string" ? storedAnswers.vulnerableFeeling : "",
          belief: typeof storedAnswers.belief === "string" ? storedAnswers.belief : "",
          fear: typeof storedAnswers.fear === "string" ? storedAnswers.fear : "",
          falseIdentity: typeof storedAnswers.falseIdentity === "string" ? storedAnswers.falseIdentity : ""
        };
        const nextStep = Math.max(0, Math.min(STEPS.length - 1, Number(parsed?.stepIndex ?? 0)));
        setAnswers(nextAnswers);
        setStepIndex(nextStep);
        const storedGuidance = typeof parsed?.guidance === "string" ? parsed.guidance : "";
        const storedHints = Array.isArray(parsed?.hintBullets) ? parsed.hintBullets : [];
        const storedSuggestions = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
        setGuidance(storedGuidance);
        setHintBullets(storedHints);
        setSuggestions(storedSuggestions);
        setSelectedTitle(typeof parsed?.selectedTitle === "string" ? parsed.selectedTitle : "");
        setHintStatus(
          storedGuidance || storedHints.length || storedSuggestions.length ? "ready" : "idle"
        );
      }
    } catch {
      // Ignore storage errors and continue with defaults.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded || typeof window === "undefined") return;
    const payload = {
      stepIndex,
      answers,
      guidance,
      hintBullets,
      suggestions,
      selectedTitle
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors.
    }
  }, [loaded, stepIndex, answers, guidance, hintBullets, suggestions, selectedTitle]);

  async function handleContinue() {
    if (!canContinue) return;
    setBusy(true);
    setError("");

    const trimmedValue = currentValue.trim();
    const nextAnswers = { ...answers, [step.key]: trimmedValue };
    const nextStepIndex = Math.min(stepIndex + 1, STEPS.length - 1);
    setAnswers(nextAnswers);
    setStepIndex(nextStepIndex);
    setGuidance("");
    setHintBullets([]);
    setSuggestions([]);
    setHintStatus("loading");
    const payload = { step: stepIndex + 1, answers: nextAnswers };

    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Request failed");
      setGuidance(typeof j.guidance === "string" ? j.guidance : "");
      setHintBullets(Array.isArray(j.hintBullets) ? j.hintBullets : []);
      setSuggestions(Array.isArray(j.suggestions) ? j.suggestions : []);
      setHintStatus("ready");
    } catch {
      setError("Unable to generate guidance. Please try again.");
      setHintStatus("ready");
    } finally {
      setBusy(false);
    }
  }

  function handleChange(value: string) {
    setAnswers(prev => ({ ...prev, [step.key]: value }));
  }

  function handleSelect(choice: Suggestion) {
    setAnswers(prev => ({ ...prev, falseIdentity: choice.identityId }));
    setSelectedTitle(choice.title);
  }

  function handleReset() {
    setAnswers({ ...EMPTY_ANSWERS });
    setStepIndex(0);
    setGuidance("");
    setHintBullets([]);
    setSuggestions([]);
    setSelectedTitle("");
    setError("");
    setBusy(false);
    setHintStatus("idle");
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors.
      }
    }
  }

  return (
    <div className="home">
      <section className="card exercise" id="exercise">
        <div className="cardHeader">
          <div className="eyebrow">Identity exercise</div>
          <h1 className="heroTitle">UNCOVERING YOUR FALSE IDENTITY</h1>
          <p className="p">
            After each answer, you will receive guidance for the next step.
          </p>
        </div>

        <div className="exerciseBody">
          <div className="stepRow">
            <div className="stepMeta">
              <span className="stepBadge">Step {stepIndex + 1} of {STEPS.length}</span>
              {isComplete ? <span className="stepBadge success">Complete</span> : null}
            </div>
            {hasProgress ? (
              <button className="resetButton" type="button" onClick={handleReset}>
                Start over
              </button>
            ) : null}
          </div>

          <div className="questionBlock">
            <div className="questionTitle">{step.title}</div>
            <div className="questionPrompt">{step.question}</div>
            <div className="questionHelper">{step.helper}</div>
            {step.example ? <div className="questionExample">Example: {step.example}</div> : null}
          </div>

          {stepIndex > 0 ? (
            <div className={"responseStack" + (isThinking ? " isThinking" : "")}>
              <div className="responsePlaceholder" aria-hidden={!isThinking}>
                <div className="reflectTitle">
                  <span>Feel</span>
                  <span>Think</span>
                  <span>Reflect</span>
                </div>
              </div>
              <div className="responseContent" aria-hidden={isThinking}>
                <div className="guidance" aria-live="polite">
                  <div className="guidanceTitle">Guidance for this step</div>
                  <p className="p">{guidance}</p>
                  {hintBullets.length ? (
                    <ul className="hintList">
                      {hintBullets.map((hint, index) => (
                        <li key={index}>{hint}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {inputSection}
              </div>
            </div>
          ) : (
            inputSection
          )}
        </div>
      </section>

      <section className="card library" id="library">
        <div className="cardHeader">
          <h2 className="h2">Identity Library</h2>
          <p className="p">
            Browse and explore identities by searching names, beliefs, and behaviors.
          </p>
        </div>

        <div className="row">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search (e.g., safety, rejected, control)"
          />
        </div>

        <div style={{ marginTop: 12 }} className="row">
          {tags.length ? (
            tags.map(t => (
              <button
                key={t}
                className={"chip" + (tag === t ? " active" : "")}
                onClick={() => setTag(t)}
              >
                {t}
              </button>
            ))
          ) : null}
        </div>

        <div style={{ marginTop: 12 }} className="libraryGrid">
          {results.map(r => (
            <a key={r.id} className="tile" href={`/identity/${r.id}`}>
              <div className="tileTitle">{r.title}</div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
