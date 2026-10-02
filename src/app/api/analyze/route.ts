import { NextResponse } from 'next/server';

export const maxDuration = 60;

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ─── JSON schema description sent to the AI ──────────────────────────────────
const JSON_SCHEMA = `{
  "directions": [
    {
      "title": "string — career role name",
      "summary": "string — one-line description of the role",
      "fit_rationale": "string — 2-3 sentences explaining why this fits THIS student's specific profile",
      "feasibility": {
        "band": "one of: Emerging Fit | Good Fit | Strong Fit",
        "approx_range": "string — e.g. '75-85%'",
        "explanation": "string — why this band, referencing the student's hours/week and background"
      },
      "skills_have": [{ "skill": "string" }],
      "skills_needed": [
        {
          "skill": "string",
          "priority": "one of: high | medium | low",
          "learning_resources": [
            { "platform": "string", "type": "free or paid", "approx_price": "string" }
          ]
        }
      ],
      "roadmap": {
        "stages": [
          {
            "stage": "string — one of: Foundation | Core Skills | Applied Projects | Portfolio / Proof of Work | Job-Ready",
            "timeframe": "string — calculated from hours/week, e.g. '2-3 months'",
            "actions": ["string — specific, concrete action (not generic)"]
          }
        ]
      }
    }
  ],
  "assumptions_and_caveats": ["string"]
}`;

// ─── Call Groq ────────────────────────────────────────────────────────────────
async function callGroq(messages: { role: string; content: string }[], jsonMode = false): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error('GROQ_API_KEY not set');

  const body: Record<string, unknown> = {
    model: GROQ_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  };
  if (jsonMode) {
    body.response_format = { type: 'json_object' };
    body.temperature = 0.3;
    body.max_tokens = 6000;
  }

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('Groq returned empty response');
  return text;
}

// ─── Call Gemini (backup) ─────────────────────────────────────────────────────
async function callGemini(systemPrompt: string, userContent: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error('GEMINI_API_KEY not set');

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userContent }] }],
      generationConfig: { maxOutputTokens: 6000, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  let text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  text = text.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  if (!text) throw new Error('Gemini returned empty response');
  return text;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  let language = 'en';

  try {
    const body = await req.json();
    language = body.language || 'en';
    const englishLevel = body.englishLevel;
    const profile = body.profile;

    const isHi = language === 'hi';

    const systemPrompt = `You are Career Compass, an expert career advisor for students in India and globally.

Analyse the student profile the user sends and return 2–4 personalised career directions as VALID JSON ONLY.

STRICT RULES:
1. Tailor every field to THIS student's actual degree, skills, interests, and career options — never give generic advice.
2. The "fit_rationale" must reference the student's specific inputs (degree, named skills, stated interests).
3. All roadmap "timeframe" values must be calculated from the student's hours_per_week (e.g. 10 hrs/week = longer timelines than 40 hrs/week).
4. "skills_have" must list skills from the student's actual profile that are relevant to that direction.
5. "skills_needed" must include real platforms (Coursera, Udemy, freeCodeCamp, etc.) with actual approximate prices.
6. Each roadmap must have EXACTLY 5 stages: Foundation → Core Skills → Applied Projects → Portfolio / Proof of Work → Job-Ready.
7. "assumptions_and_caveats" must reference the student's actual constraints (budget, location, timeline).
8. Return ONLY valid JSON matching this schema exactly — no markdown, no explanation outside JSON:

${JSON_SCHEMA}
${isHi ? '\nCRITICAL: Translate ALL string values to Hindi. Keep JSON keys in English.' : ''}
${englishLevel ? `\nStudent's English comfort level: ${englishLevel}. Adjust vocabulary in your output accordingly.` : ''}`;

    const userContent = `Student profile:\n${JSON.stringify(profile, null, 2)}`;

    let rawText = '';
    let source = '';

    // ── 1. Try Groq (primary) ───────────────────────────────────────────────
    try {
      rawText = await callGroq(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        true // json_mode
      );
      source = 'Groq';
    } catch (groqErr) {
      console.warn('[Analyze] Groq failed:', (groqErr as Error).message);

      // ── 2. Try Gemini (backup) ────────────────────────────────────────────
      try {
        rawText = await callGemini(systemPrompt, userContent);
        source = 'Gemini';
      } catch (geminiErr) {
        console.warn('[Analyze] Gemini also failed:', (geminiErr as Error).message);
        throw new Error('Both AI providers unavailable');
      }
    }

    // ── Parse response ──────────────────────────────────────────────────────
    rawText = rawText.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    const data = JSON.parse(rawText);

    if (!data?.directions?.length) {
      throw new Error('AI returned empty directions array');
    }

    console.log(`[Analyze] Success via ${source}. Directions: ${data.directions.length}`);
    return NextResponse.json(data);

  } catch (err) {
    console.error('[Analyze] Fatal error:', (err as Error).message);
    return NextResponse.json({
      directions: [],
      assumptions_and_caveats: [
        language === 'hi'
          ? 'AI सेवा अभी उपलब्ध नहीं है। कृपया 30 सेकंड बाद पुनः प्रयास करें।'
          : 'The AI service is temporarily unavailable. Please try again in 30 seconds.',
      ],
    }, { status: 503 });
  }
}
