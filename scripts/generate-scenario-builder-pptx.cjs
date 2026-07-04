/**
 * Generates Scenario Builder marketing PowerPoint (.pptx).
 * Run: npm run slides
 * All content consolidated into 5 slides; no content removed.
 */
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pres = new PptxGenJS();

pres.author = 'Netcompany — Research & Innovation Development';
pres.title = 'Scenario Builder — Platform Overview';
pres.subject = 'Scenario-based training and assessment platform';
pres.company = 'Netcompany';

const colors = {
  primary: '1a365d',
  accent: '2b6cb0',
  text: '2d3748',
  white: 'ffffff',
};

// ========== SLIDE 1: Title ==========
const s1 = pres.addSlide();
s1.background = { color: colors.primary };
s1.addText('Scenario Builder', {
  x: 0.5, y: 1.8, w: 9, h: 1,
  fontSize: 44, bold: true, color: colors.white, align: 'center',
});
s1.addText('One platform for scenario-based training and assessment', {
  x: 0.5, y: 2.6, w: 9, h: 0.5,
  fontSize: 22, color: 'b0b0b0', align: 'center',
});
s1.addText('From scenario to score — one coherent experience.', {
  x: 0.5, y: 3.4, w: 9, h: 0.4,
  fontSize: 16, italic: true, color: 'cbd5e0', align: 'center',
});
s1.addText('Netcompany — Research & Innovation Development', {
  x: 0.5, y: 5.0, w: 9, h: 0.35,
  fontSize: 12, color: 'a0aec0', align: 'center',
});

// ========== SLIDE 2: Challenge & Solution (combined) ==========
const s2 = pres.addSlide();
s2.addText('The Challenge & The Solution', {
  x: 0.5, y: 0.2, w: 9, h: 0.5,
  fontSize: 28, bold: true, color: colors.primary,
});

s2.addText('The Challenge', {
  x: 0.5, y: 0.7, w: 4.3, h: 0.3,
  fontSize: 14, bold: true, color: colors.accent,
});
s2.addText('Training and assessment teams often face:', {
  x: 0.5, y: 0.95, w: 4.3, h: 0.25,
  fontSize: 10, color: colors.text,
});
const challengeBullets = [
  'Fragmented tools — scenario catalogues, exercises, and analytics live in different systems or spreadsheets',
  'Mixed technologies — different scenario types and backends require custom integrations every time',
  'Real-time needs — exercises need timers, draft saving, and instant submit; hard to do well ad hoc',
  'Scale and reliability — more users and scenarios demand a single, robust frontend that works everywhere',
];
s2.addText(challengeBullets.map(b => '• ' + b).join('\n'), {
  x: 0.55, y: 1.2, w: 4.2, h: 2.0,
  fontSize: 10, color: colors.text, valign: 'top',
});
s2.addText('"Instead of building one-off UIs per project, we designed a modular, reusable platform."', {
  x: 0.5, y: 3.25, w: 4.35, h: 0.7,
  fontSize: 10, italic: true, color: colors.accent, valign: 'top',
});

s2.addText('The Solution: Scenario Builder', {
  x: 5.0, y: 0.7, w: 4.3, h: 0.3,
  fontSize: 14, bold: true, color: colors.accent,
});
const solutionBullets = [
  'One place — run exercises, track assignments, and view analytics in a single, secure application',
  'Real-time exercises — pick a scenario, work through incidents step-by-step with a countdown timer; save progress and submit for grading',
  'Clear outcomes — assignment history, per-incident scores, cohort comparison, and exportable reports (e.g. PDF)',
  'Secure & flexible — identity and access via your existing identity provider; works across training and pilot environments',
];
s2.addText(solutionBullets.map(b => '• ' + b).join('\n'), {
  x: 5.05, y: 1.0, w: 4.2, h: 2.2,
  fontSize: 10, color: colors.text, valign: 'top',
});
s2.addText('A production-ready digital backbone for scenario-based learning.', {
  x: 5.0, y: 3.3, w: 4.35, h: 0.5,
  fontSize: 11, bold: true, color: colors.accent, valign: 'top',
});

// ========== SLIDE 3: How It Works (diagram + detail) ==========
const s3 = pres.addSlide();
s3.addText('How It Works', {
  x: 0.5, y: 0.15, w: 9, h: 0.4,
  fontSize: 26, bold: true, color: colors.primary,
});
s3.addText('End-to-end flow in one platform', {
  x: 0.5, y: 0.5, w: 9, h: 0.25,
  fontSize: 12, color: colors.text,
});

const boxW = 1.35;
const boxH = 0.7;
const startX = 0.6;
const yBox = 0.85;
const stepGap = 0.28;

const steps = [
  { label: 'Scenarios', sub: 'Catalogue' },
  { label: 'Start', sub: 'Exercise' },
  { label: 'Incidents', sub: 'Timer & draft' },
  { label: 'Submit', sub: 'Grading' },
  { label: 'Analytics', sub: 'Scores & PDF' },
];

steps.forEach((step, i) => {
  const x = startX + i * (boxW + stepGap);
  s3.addShape('rect', {
    x, y: yBox, w: boxW, h: boxH,
    fill: { color: colors.accent },
    line: { color: colors.primary, pt: 1 },
    rectRadius: 0.08,
  });
  s3.addText(step.label, {
    x: x + 0.04, y: yBox + 0.12, w: boxW - 0.08, h: 0.32,
    fontSize: 10, bold: true, color: colors.white, align: 'center',
  });
  s3.addText(step.sub, {
    x: x + 0.04, y: yBox + 0.42, w: boxW - 0.08, h: 0.24,
    fontSize: 8, color: 'e2e8f0', align: 'center',
  });
  if (i < steps.length - 1) {
    s3.addShape('line', {
      x: x + boxW, y: yBox + boxH / 2,
      w: Math.max(0.15, stepGap - 0.02), h: 0,
      line: { color: colors.primary, width: 1.5, endArrowType: 'triangle' },
    });
  }
});

s3.addText('In detail:', {
  x: 0.5, y: 1.65, w: 9, h: 0.25,
  fontSize: 11, bold: true, color: colors.primary,
});
const detailBullets = [
  'Scenarios — User browses the catalogue (filterable table), picks a scenario, clicks "Start Simulation"; an assignment is created and linked.',
  'Start exercise — App switches to simulation mode (full-screen): one scenario, one attempt. User works through incidents.',
  'Incidents — For each: title, timestamp, description, inject. User types response (draft saved automatically); countdown timer; "Next" (with confirmation). Progress can be resumed after refresh.',
  'Submit — When all incidents are done or timer reaches zero, user submits; full solution sent for grading; results stored; user returns to main app.',
  'Analytics — Assignment history with overall scores; per-assignment details (grade per incident, charts); user/cohort analytics (percentile, comparison); export to PDF.',
];
s3.addText(detailBullets.map((b, i) => (i + 1) + '. ' + b).join('\n'), {
  x: 0.55, y: 1.9, w: 8.9, h: 2.5,
  fontSize: 9, color: colors.text, valign: 'top',
});
s3.addText('Same flow for every scenario type — configure once, reuse everywhere.', {
  x: 0.5, y: 4.5, w: 9, h: 0.35,
  fontSize: 10, italic: true, color: colors.text, align: 'center',
});

// ========== SLIDE 4: Trainees, exercises, LLMs & feedback (combined) ==========
const s4 = pres.addSlide();
s4.addText('Trainees, exercises, LLMs & the feedback loop', {
  x: 0.5, y: 0.15, w: 9, h: 0.4,
  fontSize: 24, bold: true, color: colors.primary,
});

s4.addText('How trainees create and run exercises', {
  x: 0.5, y: 0.55, w: 4.35, h: 0.28,
  fontSize: 12, bold: true, color: colors.accent,
});
const traineeBullets = [
  'Trainees run exercises; they do not author scenarios. Trainers/authors publish scenarios; trainees consume them.',
  'Create an exercise — Browse catalogue, pick scenario, "Start Simulation". Platform creates an assignment (one instance) tied to that scenario and trainee.',
  'Run — Work through each incident: read description and inject, type response (draft saved), confirm "Next". Countdown timer; can resume after refresh.',
  'Submit — When done or time is up, trainee submits; answers sent for grading; assignment complete; scores stored.',
  'Result — One trainee, many assignments. Each produces a score and per-incident feedback — raw material for the feedback loop.',
];
s4.addText(traineeBullets.map((b, i) => (i + 1) + '. ' + b).join('\n'), {
  x: 0.55, y: 0.82, w: 4.25, h: 2.15,
  fontSize: 9, color: colors.text, valign: 'top',
});

s4.addText('LLMs in scenario building', {
  x: 5.0, y: 0.55, w: 4.35, h: 0.28,
  fontSize: 12, bold: true, color: colors.accent,
});
const llmBullets = [
  'Generate or enrich scenario content — incident descriptions, injects, expected-action hints from learning objectives.',
  'Suggest or vary scenarios — recommend by role, skill gap, or past performance; generate variants of existing scenarios.',
  'Support grading and feedback — score free-text answers, generate constructive feedback, suggest model answers.',
];
s4.addText(llmBullets.map(b => '• ' + b).join('\n'), {
  x: 5.05, y: 0.82, w: 4.25, h: 1.1,
  fontSize: 9, color: colors.text, valign: 'top',
});

s4.addText('The feedback loop', {
  x: 5.0, y: 1.95, w: 4.35, h: 0.28,
  fontSize: 12, bold: true, color: colors.accent,
});
const loopBullets = [
  'Trainee submits → graded (rule or LLM) → scores and feedback stored and shown in analytics.',
  'Trainee sees results — per-incident grades, overall score, percentile vs. cohort; can export reports (e.g. PDF).',
  'Aggregated outcomes feed back — authors/trainers refine scenarios, add new ones, recommend next exercises; LLMs can use outcome data to improve scenario generation and feedback.',
];
s4.addText(loopBullets.map(b => '• ' + b).join('\n'), {
  x: 5.05, y: 2.22, w: 4.25, h: 1.35,
  fontSize: 9, color: colors.text, valign: 'top',
});

s4.addText('Cycle: do exercise → get feedback → improve (trainee skills & scenario quality).', {
  x: 0.5, y: 3.1, w: 9, h: 0.3,
  fontSize: 10, italic: true, color: colors.primary, align: 'center',
});

const loopY = 3.45;
const loopBoxW = 1.3;
const loopBoxH = 0.5;
const loopLabels = ['Trainee\nstarts', 'Submit', 'Grade', 'Feedback\n& analytics'];
for (let i = 0; i < loopLabels.length; i++) {
  const lx = 0.9 + i * 2.15;
  s4.addShape('rect', {
    x: lx, y: loopY, w: loopBoxW, h: loopBoxH,
    fill: { color: colors.accent },
    line: { color: colors.primary, pt: 0.5 },
    rectRadius: 0.06,
  });
  s4.addText(loopLabels[i], {
    x: lx + 0.04, y: loopY + 0.05, w: loopBoxW - 0.08, h: loopBoxH - 0.1,
    fontSize: 8, bold: true, color: colors.white, align: 'center', valign: 'middle',
  });
  if (i < loopLabels.length - 1) {
    s4.addShape('line', {
      x: lx + loopBoxW, y: loopY + loopBoxH / 2,
      w: 2.15 - loopBoxW - 0.02, h: 0,
      line: { color: colors.primary, width: 1.2, endArrowType: 'triangle' },
    });
  }
}
s4.addText('Results feed back into trainee progress and scenario authoring (improve or add scenarios).', {
  x: 0.5, y: 4.1, w: 9, h: 0.3,
  fontSize: 9, color: colors.text, align: 'center',
});

// ========== SLIDE 5: Why It Matters & Thank you (combined) ==========
const s5 = pres.addSlide();
s5.addText('Why It Matters', {
  x: 0.5, y: 0.2, w: 9, h: 0.45,
  fontSize: 26, bold: true, color: colors.primary,
});
s5.addText('Strategic value', {
  x: 0.5, y: 0.6, w: 9, h: 0.28,
  fontSize: 14, color: colors.text,
});
const bullets5 = [
  'Stop reinventing — Reuse the same platform for new scenarios and clients instead of building one-off training UIs.',
  'Build lasting IP — One reusable flow becomes your standard for training products.',
  'Scale with confidence — One architecture for many domains: incident response, assessments, cohort analytics.',
  'Trust and compliance — Centralised identity, secure access, and consistent integration simplify security and audit.',
];
s5.addText(bullets5.map(b => '• ' + b).join('\n'), {
  x: 0.55, y: 0.9, w: 8.9, h: 1.6,
  fontSize: 12, color: colors.text, valign: 'top',
});
s5.addText('"Transforms project execution capability into strategic digital leverage."', {
  x: 0.5, y: 2.55, w: 9, h: 0.4,
  fontSize: 12, italic: true, color: colors.accent, align: 'center',
});
s5.addText('We deliver a production-ready training platform — scalable digital foundations for the long term.', {
  x: 0.5, y: 2.95, w: 9, h: 0.4,
  fontSize: 11, bold: true, color: colors.primary, align: 'center',
});

s5.addShape('rect', {
  x: 0.3, y: 3.5, w: 9.4, h: 1.9,
  fill: { color: colors.primary },
  rectRadius: 0.1,
});
s5.addText('Thank you', {
  x: 0.5, y: 3.75, w: 9, h: 0.5,
  fontSize: 32, bold: true, color: colors.white, align: 'center',
});
s5.addText('Scenario Builder — One platform. Many scenarios. One coherent experience.', {
  x: 0.5, y: 4.25, w: 9, h: 0.4,
  fontSize: 14, color: 'cbd5e0', align: 'center',
});
s5.addText('Netcompany — Research & Innovation Development', {
  x: 0.5, y: 4.85, w: 9, h: 0.3,
  fontSize: 11, color: 'a0aec0', align: 'center',
});

// Write
const outDir = path.join(process.cwd(), 'docs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'Scenario_Builder_Marketing.pptx');

pres.writeFile({ fileName: outPath })
  .then(() => console.log('Created:', outPath))
  .catch((err) => console.error('Error writing PPTX:', err));
