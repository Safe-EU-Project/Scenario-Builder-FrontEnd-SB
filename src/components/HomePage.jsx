import { Link } from "react-router-dom";
import { BsPlayCircleFill } from "react-icons/bs";
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiBook,
  FiCheckCircle,
  FiClipboard,
  FiFileText,
  FiLayers,
  FiShield,
  FiZap,
} from "react-icons/fi";
import keycloak from "../keycloak";
import "./styles/HomePage.css";

const baseQuickActions = [
  {
    to: "/start-exercise",
    icon: <BsPlayCircleFill />,
    title: "Start Exercise",
    description: "Launch a new scenario simulation",
  },
  {
    to: "/my-assignments",
    icon: <FiClipboard />,
    title: "My Assignments",
    description: "View your completed exercises and scores",
  },
  {
    to: "/user-stats",
    icon: <FiBarChart2 />,
    title: "User Analytics",
    description: "Track your performance stats",
  },
  {
    to: "/guide",
    icon: <FiBook />,
    title: "User Guide",
    description: "Learn how to use the platform",
  },
];

function HomePage() {
  const username =
    keycloak?.tokenParsed?.preferred_username ||
    keycloak?.tokenParsed?.name ||
    "there";
  const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
  const isTrainer = roles.includes("trainer");
  const role = isTrainer ? "Trainer workspace" : "Trainee workspace";
  const quickActions = isTrainer
    ? [
        ...baseQuickActions.slice(0, 3),
        {
          to: "/trainer/scenarios",
          icon: <FiFileText />,
          title: "My Scenarios",
          description: "Create, review and manage exercises",
        },
      ]
    : baseQuickActions;

  return (
    <div className="home-page">
      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-copy">
          <div className="home-context-row">
            <span className="home-role-chip"><FiShield /> {role}</span>
            <span className="home-ready-chip"><span className="live-dot" /> Systems ready</span>
          </div>
          <p className="home-eyebrow">{import.meta.env.VITE_APP_NAME || "SCENARIO BUILDER"} / OPERATIONS</p>
          <h1 className="home-title">
            Welcome back, <span className="home-title-accent">{username}</span>
          </h1>
          <p className="home-subtitle">
            Run adaptive cyber exercises, evaluate response decisions and turn each
            simulation into measurable operational readiness.
          </p>
          <div className="home-hero-actions">
            <Link to="/start-exercise" className="home-primary-cta">
              <BsPlayCircleFill /> Start an exercise <FiArrowRight />
            </Link>
            {isTrainer && (
              <Link to="/trainer/scenarios" className="home-secondary-cta">
                <FiLayers /> Manage scenarios
              </Link>
            )}
          </div>
        </div>
        <div className="home-command-card">
          <div className="home-command-head">
            <div>
              <span>SAFE Scenario Engine</span>
              <strong>Operational</strong>
            </div>
            <FiActivity />
          </div>
          <div className="home-command-flow">
            <div><FiFileText /><span>Grounded scenario</span><FiCheckCircle /></div>
            <div><FiZap /><span>Adaptive simulation</span><FiCheckCircle /></div>
            <div><FiBarChart2 /><span>AI-assisted debrief</span><FiCheckCircle /></div>
          </div>
          <p>Threat intelligence → decisions → measurable outcomes</p>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="home-section">
        <div className="home-section-head">
          <div>
            <p className="home-section-label">WORKSPACE</p>
            <h2>Continue your work</h2>
          </div>
          <span>Choose a module</span>
        </div>
        <div className="home-actions-grid">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to} className="home-action-card">
              <div className="home-action-icon">{action.icon}</div>
              <div className="home-action-body">
                <h3 className="home-action-title">{action.title}</h3>
                <p className="home-action-desc">{action.description}</p>
              </div>
              <FiArrowRight className="home-action-arrow" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
