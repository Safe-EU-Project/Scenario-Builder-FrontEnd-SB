const CHANGELOG = [
  {
    version: "1.0.0",
    date: "2026-06-23",
    label: "First Stable Release",
    sections: [
      {
        title: "What's New",
        items: [
          {
            heading: "Policy Draft Generator",
            body: "Trainers can generate a formal LEA policy document from any scenario. The system analyses trainee performance and produces a structured report covering risks, procedures, controls, and recommendations — downloadable as a Markdown file.",
          },
          {
            heading: "Trainer Dashboard",
            body: "A dedicated Policy Drafts page lists all your scenarios with run counts and unique trainee numbers (your own test runs excluded).",
          },
          {
            heading: "Role-Based Interface",
            body: "The sidebar and pages now adapt to your role. Trainer-only features are hidden from trainees; your role label is shown correctly in the top bar.",
          },
          {
            heading: "AI-Powered Step Grading",
            body: "Simulation responses are now evaluated by the AI model for richer, contextual feedback instead of keyword matching.",
          },
          {
            heading: "Debrief Report",
            body: "At the end of every simulation you receive an AI-generated summary of your performance, strengths, and areas to improve.",
          },
          {
            heading: "Predictive Threat Analysis",
            body: "The Next Step panel now shows calibrated predictions of likely follow-on attack vectors based on the current simulation state.",
          },
          {
            heading: "User Analytics",
            body: "A dedicated analytics view breaks down your performance by threat type, attack vector, and response quality over time.",
          },
        ],
      },
      {
        title: "Bug Fixes",
        items: [
          {
            heading: "Sign-out redirect",
            body: "Logging out no longer shows an \"Invalid redirect URI\" error.",
          },
          {
            heading: "User session continuity",
            body: "Returning users are now correctly matched to their existing data across sessions.",
          },
        ],
      },
    ],
  },
];

export default CHANGELOG;
