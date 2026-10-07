import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiChevronDown,
  FiClipboard,
  FiCpu,
  FiEdit3,
  FiFileText,
  FiLayers,
  FiPlay,
  FiSend,
  FiShield,
  FiTarget,
} from "react-icons/fi";
import keycloak from "../keycloak";
import "./styles/GuidePage.css";

const traineeSteps = [
  {
    icon: FiPlay,
    title: "Choose an exercise",
    text: "Open Start Exercise and launch a scenario from the simulation library.",
    detail: "Review the scenario title, then select Launch. SAFE creates your individual assignment and starts the exercise clock. Your progress is saved locally, so a browser refresh can resume the active exercise.",
    outcome: "An active simulation opens at incident 1.",
    tip: "Use a trainee account when validating the complete exercise workflow.",
  },
  {
    icon: FiEdit3,
    title: "Respond to each incident",
    text: "Describe the concrete actions you would take with the information available at that moment.",
    detail: "Write decisions, not observations. Include who you notify, what you contain, what evidence you preserve and which business process you protect. The evaluator understands semantic equivalents, so natural language is expected.",
    outcome: "Your action is stored for scoring and the final debrief.",
    tip: "Avoid generic answers such as “investigate further”; name the actual containment or escalation action.",
  },
  {
    icon: FiActivity,
    title: "Review live feedback",
    text: "Use the score, matched actions and threat prediction before continuing.",
    detail: "The grader compares your response with the hidden expected actions and streams constructive feedback. In parallel, the simulation director chooses the next unvisited incident based on your response and predicts the next threat vector.",
    outcome: "You see what was covered, what was missed and what may happen next.",
    tip: "The next incident is adaptive, but it always stays inside the trainer-authored scenario.",
  },
  {
    icon: FiBarChart2,
    title: "Study the final dashboard",
    text: "Review strengths, gaps, recommendations and the complete attack-path analysis.",
    detail: "At completion, SAFE creates a performance debrief and a T7.4 attack-chain view with MITRE ATT&CK techniques, exploited weaknesses, pivot targets, IOCs, containment windows and the best defensive action for each stage.",
    outcome: "Your score is saved and remains available under My Assignments.",
    tip: "Expand each exploitation path to understand where the attack could have been interrupted.",
  },
];

const trainerSteps = [
  {
    icon: FiCpu,
    title: "Generate with AI + RAG",
    text: "Create a grounded draft from a title, sector and operational description.",
    detail: "Select My Scenarios → Create Scenario. Describe the threat, target environment and desired exercise phases. Sector steering improves retrieval from the relevant SAFE knowledge base.",
    outcome: "A multi-incident draft opens directly in the human-review editor.",
    tip: "State the learning objective and required constraints; do not prescribe every incident.",
  },
  {
    icon: FiLayers,
    title: "Review the incident chain",
    text: "Validate chronology, injects, expected actions and predictive metadata.",
    detail: "Use the editor to reorder the narrative through timestamps, correct inject evidence and make expected actions measurable. Each phase should introduce new information or a consequence.",
    outcome: "Saving the editor moves the scenario from Draft to Reviewed.",
    tip: "Expected actions are hidden from trainees and become the semantic grading ground truth.",
  },
  {
    icon: FiSend,
    title: "Publish and control access",
    text: "Choose who can launch the exercise, and withdraw it without deleting results.",
    detail: "A new scenario starts as Draft. The status menu stays locked until you open Edit and save, which marks it Reviewed. Reviewed scenarios are still hidden. Publishing opens the audience dialog: all registered trainees, selected people, or one or more trainee groups. Published can return to Reviewed or Archived. Archived can return to Reviewed. Returning a scenario to Reviewed or Archived removes it from the trainee library and blocks new launches. Completed answers and grades remain.",
    outcome: "Only Published scenarios appear to the selected audience.",
    tip: "Use Archived to retire an exercise. It is not a delete action.",
  },
  {
    icon: FiFileText,
    title: "Generate policy guidance",
    text: "Turn exercise evidence into a structured policy draft for review.",
    detail: "From My Scenarios, generate the policy draft after the scenario has been reviewed. SAFE summarizes risks, controls, escalation paths and reporting obligations for human approval.",
    outcome: "A reviewable, exportable policy document is produced.",
    tip: "Treat generated policy as a draft; legal and operational owners remain the approvers.",
  },
  {
    icon: FiBarChart2,
    title: "Measure readiness",
    text: "Use runs, unique trainees and assignment analytics to identify recurring gaps.",
    detail: "Scenario statistics show adoption. Assignment and user analytics show performance patterns, while incident-level scores reveal which decisions need additional training.",
    outcome: "Training improvements are based on evidence rather than completion counts alone.",
    tip: "Compare repeated runs of the same scenario after changing procedures or controls.",
  },
];

const lifecycleStatuses = [
  ["Draft", "Just created. Open Edit, review the incidents and save. Saving changes it to Reviewed."],
  ["Reviewed", "Checked by the trainer, but still hidden from trainees. It can become Published or Archived."],
  ["Published", "Visible to trainees. Audience can be everyone, selected people, or trainee groups."],
  ["Archived", "Removed from the trainee library. Past answers and grades stay. It is not deleted."],
];

const concepts = [
  ["How is the score calculated?", "The LLM compares the trainee response semantically with the expected actions authored for the current incident. Equivalent wording counts; unrelated extra actions are not penalized."],
  ["How does adaptive Next Step work?", "The simulation director sees the current action, visited incidents and eligible unvisited incidents. It chooses the next causal step without inventing content outside the scenario."],
  ["What is the exploit-path dashboard?", "It maps the attack chain across the scenario: foothold, exploited weakness, ATT&CK technique, pivot target, capability gained, containment window and observable indicators."],
];

export default function GuidePage() {
  const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
  const isTrainer = roles.includes("trainer");
  const [mode, setMode] = useState("trainee");
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("safeGuideProgress") || "{}");
    } catch {
      return {};
    }
  });
  const steps = mode === "trainer" ? trainerSteps : traineeSteps;
  const current = steps[activeStep] || steps[0];
  const CurrentIcon = current.icon;
  const progressKey = `${mode}-${activeStep}`;
  const completedCount = useMemo(
    () => steps.filter((_, index) => completed[`${mode}-${index}`]).length,
    [completed, mode, steps],
  );

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setActiveStep(0);
  };

  const toggleComplete = () => {
    const next = { ...completed, [progressKey]: !completed[progressKey] };
    setCompleted(next);
    localStorage.setItem("safeGuideProgress", JSON.stringify(next));
  };

  return (
    <div className="guide-page">
      <header className="guide-hero">
        <div className="guide-hero-icon"><FiShield /></div>
        <div>
          <p>SAFE Product Guide</p>
          <h1>Run measurable cyber exercises</h1>
          <span>Interactive guidance for trainee exercises, adaptive scoring and trainer operations.</span>
        </div>
      </header>

      <section className="guide-panel">
        <div className="guide-panel-head">
          <div><p>Operational walkthrough</p><h2>Learn the SAFE workflow</h2></div>
          <span>{completedCount}/{steps.length} reviewed</span>
        </div>

        <div className="guide-tabs" role="tablist" aria-label="Guide audience">
          <button className={mode === "trainee" ? "is-active" : ""} onClick={() => switchMode("trainee")}>
            <FiTarget /> Trainee
          </button>
          {isTrainer && (
            <button className={mode === "trainer" ? "is-active" : ""} onClick={() => switchMode("trainer")}>
              <FiShield /> Trainer
            </button>
          )}
        </div>

        <div className="guide-workspace">
          <nav className="guide-step-nav" aria-label={`${mode} guide steps`}>
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <button
                  key={step.title}
                  className={activeStep === index ? "is-active" : ""}
                  onClick={() => setActiveStep(index)}
                >
                  <span className="guide-step-number">{String(index + 1).padStart(2, "0")}</span>
                  <StepIcon />
                  <span>{step.title}</span>
                  {completed[`${mode}-${index}`] && <FiCheckCircle className="guide-step-check" />}
                </button>
              );
            })}
          </nav>

          <article className="guide-detail">
            <div className="guide-detail-head">
              <div className="guide-detail-icon"><CurrentIcon /></div>
              <div>
                <span>Step {activeStep + 1} of {steps.length}</span>
                <h3>{current.title}</h3>
                <p>{current.text}</p>
              </div>
            </div>
            <div className="guide-detail-body">
              <p>{current.detail}</p>
              <div className="guide-outcome"><FiCheckCircle /><div><span>Expected outcome</span><p>{current.outcome}</p></div></div>
              <div className="guide-tip"><FiActivity /><div><span>Operator note</span><p>{current.tip}</p></div></div>
            </div>
            <div className="guide-detail-actions">
              <button className={completed[progressKey] ? "is-complete" : ""} onClick={toggleComplete}>
                <FiCheckCircle /> {completed[progressKey] ? "Reviewed" : "Mark as reviewed"}
              </button>
              {activeStep < steps.length - 1 && (
                <button onClick={() => setActiveStep((index) => index + 1)}>Next step <FiArrowRight /></button>
              )}
            </div>
          </article>
        </div>
        <Link
          to={mode === "trainer" ? "/trainer/scenarios" : "/start-exercise"}
          className="guide-cta"
        >
          {mode === "trainer" ? <FiLayers /> : <FiPlay />}
          {mode === "trainer" ? "Open My Scenarios" : "Start an exercise"}
          <FiArrowRight />
        </Link>
      </section>

      {isTrainer && (
        <section className="guide-panel guide-lifecycle">
          <div className="guide-panel-head">
            <div>
              <p>Scenario lifecycle</p>
              <h2>Draft, Reviewed, Published, Archived</h2>
            </div>
          </div>
          <div className="guide-lifecycle-grid">
            {lifecycleStatuses.map(([status, meaning]) => (
              <article key={status}>
                <span className={`guide-lifecycle-status guide-lifecycle-status--${status.toLowerCase()}`}>{status}</span>
                <p>{meaning}</p>
              </article>
            ))}
          </div>
          <div className="guide-lifecycle-rules">
            <p><strong>Allowed changes:</strong> Reviewed to Published or Archived. Published to Reviewed or Archived. Archived to Reviewed. Draft becomes Reviewed only when the editor is saved.</p>
            <p><strong>Published to Reviewed:</strong> trainees no longer see the scenario and cannot start a new exercise. Completed answers and grades remain.</p>
          </div>
        </section>
      )}

      <section className="guide-panel guide-faq">
        <div className="guide-panel-head">
          <div><p>Key concepts</p><h2>How the system makes decisions</h2></div>
          <FiClipboard />
        </div>
        {concepts.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}<FiChevronDown /></summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
