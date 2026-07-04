/**
 * Generates Scenario Builder marketing PowerPoint (.pptx).
 * Run: npm install pptxgenjs --save-dev && node scripts/generate-scenario-builder-pptx.js
 *
 * Uses CommonJS require so it runs with plain Node (project has "type": "module" but this script is CJS).
 */

const PptxGenJS = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pres = new PptxGenJS();

// Slide dimensions (16:9)
const SLIDE_W = 10;
const SLIDE_H = 5.625;

pres.author = 'Netcompany — Research & Innovation Development';
pres.title = 'Scenario Builder — Platform Overview';
pres.subject = 'Scenario-based training and assessment platform';
pres.company = 'Netcompany';

// Colors (Netcompany-inspired professional)
const colors = {
  primary: '1a365d',
  accent: '2b6cb0',
  green: '276749',
  lightBg: 'edf2f7',
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

// ========== SLIDE 2: The Challenge ==========
const s2 = pres.addSlide();
s2.addText('The Challenge', {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 32, bold: true, color: colors.primary,
});
s2.addText('Training and assessment teams often face:', {
  x: 0.5, y: 0.95, w: 9, h: 0.35,
  fontSize: 18, color: colors.text,
});
const bullets2 = [
  'Fragmented tools — scenario catalogues, exercises, and analytics live in different systems or spreadsheets',
  'Mixed technologies — different scenario types and backends require custom integrations every time',
  'Real-time needs — exercises need timers, draft saving, and instant submit; hard to do well ad hoc',
  'Scale and reliability — more users and scenarios demand a single, robust frontend that works everywhere',
];
s2.addText(bullets2.map(b => '• ' + b).join('\n'), {
  x: 0.6, y: 1.45, w: 8.8, h: 2.8,
  fontSize: 14, color: colors.text, valign: 'top',
});
s2.addText('"Instead of building one-off UIs per project, we designed a modular, reusable platform."', {
  x: 0.5, y: 4.4, w: 9, h: 0.6,
  fontSize: 14, italic: true, color: colors.accent, align: 'center',
});

// ========== SLIDE 3: The Solution ==========
const s3 = pres.addSlide();
s3.addText('The Solution: Scenario Builder', {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 32, bold: true, color: colors.primary,
});
const bullets3 = [
  'One place — run exercises, track assignments, and view analytics in a single, secure application',
  'Real-time exercises — pick a scenario, work through incidents step-by-step with a countdown timer; save progress and submit for grading',
  'Clear outcomes — assignment history, per-incident scores, cohort comparison, and exportable reports (e.g. PDF)',
  'Secure & flexible — identity and access via your existing identity provider; works across training and pilot environments',
];
s3.addText(bullets3.map(b => '• ' + b).join('\n'), {
  x: 0.6, y: 1.0, w: 8.8, h: 3.2,
  fontSize: 14, color: colors.text, valign: 'top',
});
s3.addText('A production-ready digital backbone for scenario-based learning.', {
  x: 0.5, y: 4.5, w: 9, h: 0.45,
  fontSize: 16, bold: true, color: colors.accent, align: 'center',
});

// ========== SLIDE 4: How It Works (diagram) ==========
const s4 = pres.addSlide();
s4.addText('How It Works', {
  x: 0.5, y: 0.25, w: 9, h: 0.55,
  fontSize: 32, bold: true, color: colors.primary,
});
s4.addText('End-to-end flow in one platform', {
  x: 0.5, y: 0.75, w: 9, h: 0.3,
  fontSize: 16, color: colors.text,
});

const boxW = 1.5;
const boxH = 0.9;
const startX = 0.6;
const yBox = 2.0;
const gap = 0.15;

const steps = [
  { label: 'Scenarios', sub: 'Catalogue' },
  { label: 'Start', sub: 'Exercise' },
  { label: 'Incidents', sub: 'Timer & draft' },
  { label: 'Submit', sub: 'Grading' },
  { label: 'Analytics', sub: 'Scores & PDF' },
];

steps.forEach((step, i) => {
  const x = startX + i * (boxW + gap + 0.35);
  s4.addShape('rect', {
    x, y: yBox, w: boxW, h: boxH,
    fill: { color: colors.accent },
    line: { color: colors.primary, pt: 1 },
    rectRadius: 0.1,
  });
  s4.addText(step.label, {
    x: x + 0.05, y: yBox + 0.2, w: boxW - 0.1, h: 0.4,
    fontSize: 12, bold: true, color: colors.white, align: 'center',
  });
  s4.addText(step.sub, {
    x: x + 0.05, y: yBox + 0.55, w: boxW - 0.1, h: 0.3,
    fontSize: 9, color: 'e2e8f0', align: 'center',
  });
  if (i < steps.length - 1) {
    const arrowStart = x + boxW;
    const arrowEnd = startX + (i + 1) * (boxW + gap + 0.35) - 0.1;
    s4.addShape('line', {
      x: arrowStart, y: yBox + boxH / 2,
      w: arrowEnd - arrowStart, h: 0,
      line: { color: colors.primary, width: 2, endArrowType: 'triangle' },
    });
  }
});

s4.addText('Same flow for every scenario type — configure once, reuse everywhere.', {
  x: 0.5, y: 3.25, w: 9, h: 0.4,
  fontSize: 13, italic: true, color: colors.text, align: 'center',
});

// ========== SLIDE 5: Why It Matters ==========
const s5 = pres.addSlide();
s5.addText('Why It Matters', {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 32, bold: true, color: colors.primary,
});
s5.addText('Strategic value', {
  x: 0.5, y: 0.85, w: 9, h: 0.35,
  fontSize: 18, color: colors.text,
});
const bullets5 = [
  'Stop reinventing — Reuse the same platform for new scenarios and clients instead of building one-off training UIs.',
  'Build lasting IP — One reusable flow (scenarios → exercises → assignments → analytics) becomes your standard for training products.',
  'Scale with confidence — One architecture for many domains: incident response, assessments, cohort analytics.',
  'Trust and compliance — Centralised identity, secure access, and consistent integration simplify security and audit.',
];
s5.addText(bullets5.map(b => '• ' + b).join('\n'), {
  x: 0.6, y: 1.35, w: 8.8, h: 2.6,
  fontSize: 14, color: colors.text, valign: 'top',
});
s5.addText('"Transforms project execution capability into strategic digital leverage."', {
  x: 0.5, y: 4.15, w: 9, h: 0.5,
  fontSize: 14, italic: true, color: colors.accent, align: 'center',
});
s5.addText('We deliver a production-ready training platform — scalable digital foundations for the long term.', {
  x: 0.5, y: 4.75, w: 9, h: 0.5,
  fontSize: 13, bold: true, color: colors.primary, align: 'center',
});

// ========== SLIDE 6: Thank you ==========
const s6 = pres.addSlide();
s6.background = { color: colors.primary };
s6.addText('Thank you', {
  x: 0.5, y: 2.0, w: 9, h: 0.8,
  fontSize: 40, bold: true, color: colors.white, align: 'center',
});
s6.addText('Scenario Builder — One platform. Many scenarios. One coherent experience.', {
  x: 0.5, y: 2.85, w: 9, h: 0.5,
  fontSize: 18, color: 'cbd5e0', align: 'center',
});
s6.addText('Netcompany — Research & Innovation Development', {
  x: 0.5, y: 4.8, w: 9, h: 0.35,
  fontSize: 12, color: 'a0aec0', align: 'center',
});

// ========== Write file ==========
const outDir = path.join(process.cwd(), 'docs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'Scenario_Builder_Marketing.pptx');

pres.writeFile({ fileName: outPath })
  .then(() => console.log('Created:', outPath))
  .catch((err) => console.error('Error writing PPTX:', err));
