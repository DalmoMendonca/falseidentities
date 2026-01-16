import { NextResponse } from "next/server";
import { DATASET } from "@/lib/data";

const MODEL = process.env.OPENAI_MODEL || "gpt-5-nano";
const API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 400 });
  }

  const { step, answers } = await req.json();
  const stepNum = Math.max(1, Math.min(5, Number(step || 1)));
  const nextStep = stepNum + 1;

  const identities = DATASET.falseIdentities.map(i => ({
    id: i.id,
    title: i.title,
    aka: i.aka,
    tags: i.tags,
    beliefsAboutLife: i.sections.beliefsAboutLife,
    beliefsAboutOthers: i.sections.beliefsAboutOthers,
    selfReinforcingBehaviors: i.sections.selfReinforcingBehaviors
  }));

  const steps = [
    "State your complaint (trigger) about your spouse.",
    "State your primary emotional reaction.",
    "State the vulnerable feeling below your reaction.",
    "State the belief about yourself that underlies your vulnerable feeling.",
    "Recognize your deepest fear.",
    "Choose your false identity."
  ];

  const answersText = [
    `1. Complaint: ${String(answers?.complaint || "").trim()}`,
    `2. Primary reaction: ${String(answers?.reaction || "").trim()}`,
    `3. Vulnerable feeling: ${String(answers?.vulnerableFeeling || "").trim()}`,
    `4. Belief about self: ${String(answers?.belief || "").trim()}`,
    `5. Deepest fear: ${String(answers?.fear || "").trim()}`
  ].join("\n");

  const system = [
    "You are a careful, non-clinical reflective assistant.",
    "The user is completing the 'Uncovering Your False Identity' exercise.",
    "Provide gentle guidance for the next question only, based on all answers so far.",
    "Always provide guidance and 2-4 short hint bullets.",
    "If the next question is the false-identity choice, suggest up to 3 identities from the provided dataset.",
    "If the next question is not the choice step, return suggestions as an empty array.",
    "Use only the provided identity IDs and titles; do not invent new IDs.",
    "Avoid diagnosing. Use compassionate, non-shaming language.",
    "Return strict JSON that matches the response schema with no extra keys."
  ].join("\n");

  const responseSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      guidance: { type: "string" },
      hintBullets: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
      suggestions: {
        type: "array",
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            identityId: { type: "string" },
            title: { type: "string" },
            reason: { type: "string" }
          },
          required: ["identityId", "title", "reason"]
        }
      }
    },
    required: ["guidance", "hintBullets", "suggestions"]
  };

  // OpenAI Responses API call (HTTP) -- generic to avoid SDK assumptions.
  const body = {
    model: MODEL,
    input: [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          { type: "input_text", text: `STEP_COMPLETED: ${stepNum}` },
          { type: "input_text", text: `NEXT_STEP: ${nextStep} - ${steps[nextStep - 1] || "Choose your false identity."}` },
          { type: "input_text", text: "ANSWERS_SO_FAR:\n" + answersText },
          { type: "input_text", text: "IDENTITY_DATASET_JSON:\n" + JSON.stringify(identities) },
          { type: "input_text", text: "OUTPUT_JSON_SCHEMA:\n" + JSON.stringify(responseSchema) }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "exercise_guidance",
        schema: responseSchema,
        strict: true
      }
    }
  };

  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    const t = await r.text();
    return NextResponse.json({ error: "OpenAI API error", detail: t }, { status: 500 });
  }

  const j = await r.json();
  const outputItems = Array.isArray(j?.output) ? j.output : [];
  const contentItems = outputItems.flatMap((item: any) => {
    if (Array.isArray(item?.content)) return item.content;
    if (typeof item?.content === "string") return [{ type: "output_text", text: item.content }];
    return [];
  });
  const outText = (
    contentItems
      .filter((c: any) => c?.type === "output_text" || c?.type === "text")
      .map((c: any) => c?.text)
      .filter((text: any) => typeof text === "string" && text.trim().length > 0)
      .join("\n")
    || j?.output_text
    || ""
  ).trim();

  try {
    const parsed = JSON.parse(outText);
    if (Array.isArray(parsed?.suggestions)) {
      const byId = new Map(identities.map(i => [i.id, i]));
      parsed.suggestions = parsed.suggestions
        .filter((s: any) => byId.has(s.identityId))
        .slice(0, 3)
        .map((s: any) => ({
          identityId: s.identityId,
          title: s.title || byId.get(s.identityId)?.title || s.identityId,
          reason: s.reason || ""
        }));
    }
    return NextResponse.json(parsed);
  } catch {
    const match = outText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return NextResponse.json(parsed);
      } catch {
        // Fall through to error response.
      }
    }
    return NextResponse.json({ error: "OpenAI response parse error", detail: outText }, { status: 502 });
  }
}
