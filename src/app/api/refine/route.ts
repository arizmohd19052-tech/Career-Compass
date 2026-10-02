import { NextResponse } from 'next/server';

export const maxDuration = 60;

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ─── Salary reference database ─────────────────────────────────────────────────
const SALARY_DB: Record<string, { india: string; us: string; entry: string; senior: string }> = {
  'full stack developer':     { india: '₹4–12 LPA', us: '$70k–$130k', entry: '₹4–6 LPA', senior: '₹20–35 LPA' },
  'backend engineer':         { india: '₹5–14 LPA', us: '$80k–$140k', entry: '₹5–7 LPA', senior: '₹22–38 LPA' },
  'backend api engineer':     { india: '₹5–14 LPA', us: '$80k–$140k', entry: '₹5–7 LPA', senior: '₹22–38 LPA' },
  'devops engineer':          { india: '₹6–18 LPA', us: '$90k–$150k', entry: '₹6–9 LPA', senior: '₹25–45 LPA' },
  'cloud engineer':           { india: '₹6–18 LPA', us: '$90k–$150k', entry: '₹6–9 LPA', senior: '₹25–45 LPA' },
  'machine learning engineer':{ india: '₹8–25 LPA', us: '$110k–$160k', entry: '₹8–12 LPA', senior: '₹30–60 LPA' },
  'data scientist':           { india: '₹6–20 LPA', us: '$95k–$150k', entry: '₹6–10 LPA', senior: '₹25–50 LPA' },
  'data analyst':             { india: '₹3.5–8 LPA', us: '$55k–$85k', entry: '₹3.5–5 LPA', senior: '₹12–20 LPA' },
  'ui/ux designer':           { india: '₹3.5–10 LPA', us: '$65k–$110k', entry: '₹3.5–5 LPA', senior: '₹15–25 LPA' },
  'graphic designer':         { india: '₹2.5–7 LPA', us: '$40k–$70k', entry: '₹2.5–4 LPA', senior: '₹8–15 LPA' },
  'digital marketing':        { india: '₹2.5–8 LPA', us: '$45k–$80k', entry: '₹2.5–4 LPA', senior: '₹12–22 LPA' },
  'business analyst':         { india: '₹4–12 LPA', us: '$65k–$100k', entry: '₹4–6 LPA', senior: '₹18–30 LPA' },
  'product manager':          { india: '₹8–22 LPA', us: '$100k–$160k', entry: '₹8–12 LPA', senior: '₹30–60 LPA' },
  'management consultant':    { india: '₹6–18 LPA', us: '$85k–$150k', entry: '₹6–9 LPA', senior: '₹25–50 LPA' },
  'financial analyst':        { india: '₹4–14 LPA', us: '$65k–$110k', entry: '₹4–6 LPA', senior: '₹20–40 LPA' },
  'content creator':          { india: '₹2–6 LPA + deals', us: '$35k–$70k', entry: '₹2–3.5 LPA', senior: '₹10–25 LPA' },
  'hr specialist':            { india: '₹3–9 LPA', us: '$50k–$80k', entry: '₹3–4.5 LPA', senior: '₹12–22 LPA' },
  'software developer':       { india: '₹4–12 LPA', us: '$70k–$120k', entry: '₹4–6 LPA', senior: '₹18–35 LPA' },
};

function getSalaryForRole(roleTitle: string): typeof SALARY_DB[string] | null {
  const t = roleTitle.toLowerCase();
  for (const [key, val] of Object.entries(SALARY_DB)) {
    if (t.includes(key) || key.includes(t.split(' ')[0])) return val;
  }
  return null;
}

// ─── Detect question intent ────────────────────────────────────────────────────
type Intent =
  | 'salary'
  | 'why_path'
  | 'timeline'
  | 'skills_courses'
  | 'compare'
  | 'freelance'
  | 'location'
  | 'next_step'
  | 'difference'
  | 'feasibility'
  | 'generic';

function detectIntent(q: string): Intent {
  const s = q.toLowerCase();
  if (/salary|pay|earn|income|ctc|lpa|package|stipend|wage|money|compensation/.test(s)) return 'salary';
  if (/why|reason|fit|why this|why recommend|why choose|why suggest|why am i/.test(s) && !/how|what/.test(s)) return 'why_path';
  if (/how (many|long|much|soon)|when|timeline|duration|months|weeks|time/.test(s)) return 'timeline';
  if (/course|learn|certif|platform|resource|where|study|tutorial|book/.test(s)) return 'skills_courses';
  if (/compare|vs\b|versus|better|difference|between|prefer|choose between/.test(s)) return 'compare';
  if (/freelance|side income|client|fiverr|upwork|part.?time|gig|self.?employ/.test(s)) return 'freelance';
  if (/location|remote|city|country|abroad|international|where (can|to) work/.test(s)) return 'location';
  if (/what (should|do) (i|my) (do|next|start|focus)|next step|first step|start/.test(s)) return 'next_step';
  if (/difference|what is|explain|define/.test(s)) return 'difference';
  if (/chance|probability|realistic|realistic|can i|possible|achievable|succeed/.test(s)) return 'feasibility';
  return 'generic';
}

// ─── Intent handlers ───────────────────────────────────────────────────────────
function handleSalary(q: string, directions: any[], profile: any, isHi: boolean): string {
  // Check which role the user is asking about
  const mentioned = directions.find((d: any) => q.toLowerCase().includes((d.title || '').toLowerCase().split(' ')[0].toLowerCase()));
  const target = mentioned || directions[0];
  if (!target) return isHi ? 'कृपया पहले अपना प्रोफ़ाइल सबमिट करें।' : 'Please submit your profile first to get salary estimates.';

  const sal = getSalaryForRole(target.title);
  const exp = target.feasibility?.explanation || '';

  if (sal) {
    return isHi
      ? `**${target.title}** के लिए वेतन अनुमान:\n\n• 🇮🇳 **भारत**: ${sal.india}\n  – एंट्री-लेवल: ${sal.entry}\n  – 5+ वर्षों के बाद: ${sal.senior}\n• 🇺🇸 **अमेरिका**: ${sal.us}\n\n💡 वेतन शहर (Bangalore > Tier-2), कंपनी का आकार, और प्रोजेक्ट के अनुभव के आधार पर भिन्न होता है। फ्रीलांस में इससे 30–50% अधिक कमाई संभव है।`
      : `**${target.title}** salary ranges:\n\n• 🇮🇳 **India**: ${sal.india}\n  – Entry-level (0–2 yrs): ${sal.entry}\n  – Senior (5+ yrs): ${sal.senior}\n• 🇺🇸 **US / Global**: ${sal.us}\n\n💡 Salary varies by city (Bangalore/Mumbai pay 30–40% more than Tier-2 cities), company size, and project portfolio. Freelancers with strong portfolios can earn 30–50% more than salaried employees.`;
  }

  return isHi
    ? `**${target.title}** में आमतौर पर ₹3–15 LPA की रेंज होती है, अनुभव और शहर के अनुसार। ${exp}`
    : `**${target.title}** typically ranges from ₹3–15 LPA in India depending on experience and city. ${exp}`;
}

function handleWhyPath(directions: any[], profile: any, isHi: boolean): string {
  const d = directions[0];
  if (!d) return isHi ? 'प्रोफ़ाइल डेटा उपलब्ध नहीं है।' : 'No profile data available.';
  const skills = profile?.skills?.slice(0, 3).join(', ') || 'your skills';
  const interests = profile?.interests?.slice(0, 2).join(', ') || 'your interests';
  const targets = profile?.careerOptions?.slice(0, 2).join(' / ') || d.title;
  const degree = profile?.academic?.degree || 'your degree';

  return isHi
    ? `**${d.title}** इसलिए recommend किया गया:\n\n1. **डिग्री मेल**: ${degree} इस भूमिका की नींव से मेल खाता है।\n2. **कौशल मेल**: आपके कौशल (${skills}) इस करियर में सीधे उपयोग होते हैं।\n3. **रुचि मेल**: ${interests} इस क्षेत्र के दैनिक कार्य से मेल खाती है।\n4. **लक्ष्य मेल**: आपने ${targets} में रुचि व्यक्त की है।\n\n${d.fit_rationale}`
    : `**${d.title}** was recommended for these specific reasons:\n\n1. **Degree alignment**: ${degree} maps directly to the academic foundation this role typically requires.\n2. **Skill overlap**: Your skills (${skills}) are directly applicable — you're not starting from zero.\n3. **Interest fit**: ${interests} aligns with day-to-day work in this field.\n4. **Stated goal**: You expressed interest in ${targets}, which this role directly addresses.\n\n${d.fit_rationale}`;
}

function handleTimeline(directions: any[], profile: any, isHi: boolean): string {
  const d = directions[0];
  if (!d?.roadmap?.stages) return isHi ? 'रोडमैप डेटा उपलब्ध नहीं है।' : 'Roadmap data not available.';
  const stages = d.roadmap.stages;
  const hrs = (profile?.constraints?.time || '').match(/(\d+)/)?.[1] || '15';
  const last = stages[stages.length - 1];

  const stageList = stages.map((s: any, i: number) =>
    `**${i + 1}. ${s.stage}** — ${s.timeframe}`
  ).join('\n');

  return isHi
    ? `**${d.title}** के लिए रोडमैप (${hrs} घंटे/सप्ताह पर):\n\n${stageList}\n\n⏱️ **कुल अनुमानित समय**: ${last.timeframe} में "${last.stage}" तक पहुँचना।\n💡 घंटे बढ़ाने से timeline आनुपातिक रूप से कम होती है।`
    : `**${d.title}** roadmap at **${hrs} hours/week**:\n\n${stageList}\n\n⏱️ **Total to "${last.stage}"**: approximately ${last.timeframe}.\n💡 Each time you double your weekly hours, timelines roughly halve. ${profile?.constraints?.timeline ? `Your target timeline (${profile.constraints.timeline}) is achievable if you stay consistent.` : ''}`;
}

function handleSkillsCourses(directions: any[], profile: any, isHi: boolean): string {
  const d = directions[0];
  if (!d?.skills_needed?.length) return isHi ? 'कोई कौशल डेटा उपलब्ध नहीं है।' : 'No skill data available.';

  const budget = profile?.constraints?.budget || '';
  const hasBudget = /paid|money|\$|₹|invest/i.test(budget);
  const top = d.skills_needed.slice(0, 4);

  const lines = top.map((s: any) => {
    const freeOnly = !hasBudget;
    const resources = s.learning_resources
      ?.filter((r: any) => !freeOnly || r.type === 'free')
      ?.map((r: any) => `${r.platform} (${r.approx_price})`)
      .join(', ') || s.learning_resources?.map((r: any) => `${r.platform}`).join(', ');
    return `• **${s.skill}** [${s.priority} priority]: ${resources}`;
  }).join('\n');

  return isHi
    ? `**${d.title}** के लिए ज़रूरी कौशल और संसाधन:\n\n${lines}\n\n${budget ? `आपके बजट (${budget}) के लिए, ऊपर listed free resources आदर्श हैं।` : '💡 सभी listed free resources industry-recognised हैं — paid options जल्दी structured learning देते हैं।'}`
    : `Top skills and resources for **${d.title}**:\n\n${lines}\n\n${budget ? `💡 Given your budget (${budget}), start with the free resources — they are industry-recognised and sufficient for portfolio-level work.` : '💡 Start with free resources; add paid courses only when you need structured learning or certification.'}`;
}

function handleCompare(directions: any[], _profile: any, isHi: boolean): string {
  if (directions.length < 2) return isHi ? 'तुलना के लिए कम से कम 2 करियर विकल्प आवश्यक हैं।' : 'Need at least 2 career options to compare.';
  const d1 = directions[0];
  const d2 = directions[1];
  const s1 = getSalaryForRole(d1.title);
  const s2 = getSalaryForRole(d2.title);

  return isHi
    ? `**${d1.title}** vs **${d2.title}**:\n\n| पहलू | ${d1.title} | ${d2.title} |\n|---|---|---|\n| सारांश | ${d1.summary?.slice(0, 60)}... | ${d2.summary?.slice(0, 60)}... |\n| Feasibility | ${d1.feasibility?.band} (${d1.feasibility?.approx_range}) | ${d2.feasibility?.band} (${d2.feasibility?.approx_range}) |\n| भारत वेतन | ${s1?.india || 'N/A'} | ${s2?.india || 'N/A'} |\n\n💡 यदि आप तकनीक पसंद करते हैं → **${d1.title}**। यदि रणनीति और लोग → **${d2.title}**।`
    : `**${d1.title}** vs **${d2.title}** side-by-side:\n\n| Factor | ${d1.title} | ${d2.title} |\n|---|---|---|\n| In a nutshell | ${d1.summary?.slice(0, 60)}... | ${d2.summary?.slice(0, 60)}... |\n| Feasibility | ${d1.feasibility?.band} (${d1.feasibility?.approx_range}) | ${d2.feasibility?.band} (${d2.feasibility?.approx_range}) |\n| India Salary | ${s1?.india || 'see roadmap'} | ${s2?.india || 'see roadmap'} |\n\n💡 **Choose ${d1.title}** if you prefer hands-on technical or creative work. **Choose ${d2.title}** if you prefer strategy, communication, and cross-functional work. Both are viable — pick the one that excites you on a day-to-day basis.`;
}

function handleFreelance(directions: any[], profile: any, isHi: boolean): string {
  const d = directions[0];
  const title = d?.title || 'your field';
  const sal = d ? getSalaryForRole(d.title) : null;

  return isHi
    ? `**${title}** में फ्रीलांसिंग शुरू करने के कदम:\n\n1. **Fiverr/Upwork** पर gig बनाएं — शुरुआत में कम कीमत से reviews बनाएं।\n2. **LinkedIn** पर छोटे व्यवसायों को directly message करें — free audit या sample offer करें।\n3. **पहले 3 clients** को discounted या free काम दें ताकि portfolio बने।\n4. **Niche बनाएं** — e.g., "restaurants के लिए social media" बजाय "general marketing"।\n\n💰 **Income timeline**: 3 महीने → ₹10,000–30,000/month, 12 महीने → ₹50,000–1,50,000/month`
    : `How to start freelancing in **${title}**:\n\n1. **Create a Fiverr/Upwork gig** — start with competitive pricing to build reviews fast.\n2. **DM small businesses on LinkedIn** — offer a free audit or sample to open the conversation.\n3. **First 3 clients at discounted rates** — builds portfolio and 5-star reviews.\n4. **Niche down** — e.g., "social media for restaurants" beats "general digital marketing" for conversion.\n\n💰 **Income milestones**: 3 months → ₹15k–40k/month | 12 months → ₹60k–1.5 lakh/month | 2+ years → ₹2–5 lakh/month for top freelancers.\n${sal ? `(Salaried equivalent: ${sal.india} in India)` : ''}`;
}

function handleLocation(directions: any[], profile: any, isHi: boolean): string {
  const d = directions[0];
  const loc = profile?.constraints?.location || '';
  const title = d?.title || 'this career';

  return isHi
    ? `**${title}** के लिए बेहतरीन बाज़ार:\n\n• 🇮🇳 **भारत**: Bangalore, Hyderabad, Pune, Mumbai, Gurgaon में सबसे अधिक अवसर।\n• 🌐 **रिमोट**: Toptal, Remote.co, AngelList पर apply करें — global salary पर काम करें।\n• 🌍 **विदेश**: Canada (Express Entry), Germany (Job Seeker Visa), UAE (high demand) में अवसर।\n\n${loc ? `आपकी location preference (${loc}) के अनुसार: remote से शुरुआत करना practical है।` : '💡 Remote roles allow you to earn global salaries while staying in India.'}`
    : `Job markets for **${title}**:\n\n• 🇮🇳 **India**: Bangalore, Hyderabad, Pune, Mumbai, Gurgaon — highest density of openings.\n• 🌐 **Remote**: Apply on Toptal, Remote.co, AngelList, Wellfound — earn global salaries from India.\n• 🌍 **Abroad**: Canada (Express Entry), Germany (Job Seeker Visa — no job offer needed), UAE (high demand).\n\n${loc ? `💡 Given your location preference (${loc}), remote roles bridge immediate access with geographic flexibility.` : '💡 Start remote, build 2 years of experience, then explore relocation with employer sponsorship for maximum leverage.'}`;
}

function handleNextStep(directions: any[], _profile: any, isHi: boolean): string {
  const d = directions[0];
  if (!d?.roadmap?.stages) return isHi ? 'रोडमैप उपलब्ध नहीं है।' : 'Roadmap not available.';
  const firstStage = d.roadmap.stages[0];
  const actions = firstStage?.actions?.slice(0, 3) || [];

  return isHi
    ? `**अभी शुरू करें — ${d.title}** के लिए पहले कदम:\n\n${actions.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}\n\n⏱️ पहला चरण ("${firstStage.stage}") अनुमानित समय: **${firstStage.timeframe}**.\n\n💡 पहले दिन: एक free resource choose करें और 30 मिनट शुरू करें।`
    : `**Start today** — first steps for **${d.title}**:\n\n${actions.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}\n\n⏱️ Stage 1 ("${firstStage.stage}") estimated time: **${firstStage.timeframe}**.\n\n💡 Day 1 action: Pick one free resource above and spend 30 minutes — momentum beats perfection.`;
}

function handleFeasibility(directions: any[], profile: any, isHi: boolean): string {
  const d = directions[0];
  if (!d) return isHi ? 'डेटा उपलब्ध नहीं है।' : 'No data available.';

  return isHi
    ? `**${d.title}** के लिए feasibility:\n\n• **बैंड**: ${d.feasibility?.band}\n• **रेंज**: ${d.feasibility?.approx_range}\n• **व्याख्या**: ${d.feasibility?.explanation}\n\n**${d.fit_rationale}**\n\n💡 Feasibility एक शुरुआती अनुमान है — लगातार प्रयास और portfolio बनाने से यह बढ़ती है।`
    : `**${d.title}** feasibility assessment:\n\n• **Band**: ${d.feasibility?.band}\n• **Estimated match**: ${d.feasibility?.approx_range}\n• **Explanation**: ${d.feasibility?.explanation}\n\n${d.fit_rationale}\n\n💡 Feasibility is a starting estimate — it increases significantly as you build portfolio evidence and skills. Many people in the "Emerging Fit" band land their target role within 8–12 months of focused effort.`;
}

function handleGeneric(question: string, directions: any[], profile: any, isHi: boolean): string {
  const d = directions[0];
  const stages = d?.roadmap?.stages || [];
  const allActions = stages.flatMap((s: any) => s.actions).slice(0, 5);

  return isHi
    ? `"${question}" के बारे में:\n\n${d ? `**${d.title}** के लिए, आपके रोडमैप के अनुसार ये कदम सबसे प्रासंगिक हैं:\n${allActions.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}` : 'अपना प्रोफ़ाइल सबमिट करें।'}\n\n💡 salary, timeline, courses, तुलना, या अगले कदमों के बारे में पूछें।`
    : `Regarding "${question}":\n\n${d ? `For **${d.title}**, the most relevant roadmap actions are:\n${allActions.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}` : 'Submit your profile to get personalised guidance.'}\n\n💡 Feel free to ask about: salary ranges, timelines, course recommendations, comparing your options, freelancing, or what to do right now.`;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { profile, lastResult, chatHistory, question, language, englishLevel } = await req.json();
    const isHi = language === 'hi';
    const apiKey = process.env.GEMINI_API_KEY;
    const directions = lastResult?.directions || [];

    // ── Try live Gemini ────────────────────────────────────────────────────
    if (apiKey) {
      const sysPrompt = `You are Career Compass's AI advisor. Answer the student's question directly and specifically — never give generic responses.

Key rules:
- For salary questions: give real figures for India AND globally (USD), noting variation by city/experience.
- For "why this path" questions: reference their actual skills and interests from the profile.
- For timeline questions: calculate based on their stated availability (hours/week).
- For course questions: recommend the specific platforms in their roadmap plus 1-2 extras.
- Keep answers to 3–6 sentences unless more detail is asked.
- Never say you "cannot" answer — always provide something concrete.
${isHi ? '\nCRITICAL: Respond entirely in Hindi.' : ''}
${englishLevel ? `\nEnglish level: "${englishLevel}". Adjust vocabulary accordingly.` : ''}

=== PROFILE ===
${JSON.stringify(profile)}

=== CAREER ANALYSIS ===
${JSON.stringify(lastResult)}`;

      try {
        const contents = [
          ...(chatHistory || []).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          })),
          { role: 'user', parts: [{ text: question }] },
        ];

        const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: sysPrompt }] },
            contents,
            generationConfig: { maxOutputTokens: 2048 },
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const answer = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (answer.trim()) {
            console.log('[Refine] Live Gemini answer used.');
            return NextResponse.json({ answer });
          }
        } else {
          const errText = await res.text();
          console.warn(`[Refine] Gemini ${res.status} — using intelligent responder. ${errText.slice(0, 150)}`);
        }
      } catch (e) {
        console.warn('[Refine] Fetch error — using intelligent responder:', e);
      }
    }

    // ── Intelligent offline responder ──────────────────────────────────────
    const intent = detectIntent(question);
    console.log(`[Refine] Intent: ${intent} | Question: "${question.slice(0, 80)}"`);

    let answer: string;
    switch (intent) {
      case 'salary':        answer = handleSalary(question, directions, profile, isHi); break;
      case 'why_path':      answer = handleWhyPath(directions, profile, isHi); break;
      case 'timeline':      answer = handleTimeline(directions, profile, isHi); break;
      case 'skills_courses':answer = handleSkillsCourses(directions, profile, isHi); break;
      case 'compare':       answer = handleCompare(directions, profile, isHi); break;
      case 'freelance':     answer = handleFreelance(directions, profile, isHi); break;
      case 'location':      answer = handleLocation(directions, profile, isHi); break;
      case 'next_step':     answer = handleNextStep(directions, profile, isHi); break;
      case 'feasibility':   answer = handleFeasibility(directions, profile, isHi); break;
      default:              answer = handleGeneric(question, directions, profile, isHi); break;
    }

    return NextResponse.json({ answer });

  } catch (err) {
    console.error('[Refine] Unhandled error:', err);
    return NextResponse.json({ answer: 'Please try your question again.' });
  }
}
