import { Link } from "react-router-dom";
import { BsPlayCircleFill } from "react-icons/bs";
import { FiClipboard, FiBarChart2, FiBook, FiArrowRight } from "react-icons/fi";
import keycloak from "../keycloak";
import "./styles/HomePage.css";

const quickActions = [
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

  return (
    <div className="home-page">
      {/* Hero */}
      <div className="home-hero">
        <p className="home-eyebrow">{import.meta.env.VITE_APP_NAME || "SCENARIO BUILDER"}</p>
        <h1 className="home-title">
          Welcome back,{" "}
          <span className="home-title-accent">{username}</span>
        </h1>
        <p className="home-subtitle">
          Here is an overview of your training progress and available scenarios.
        </p>
      </div>

      {/* Quick Actions */}
      <section className="home-section">
        <p className="home-section-label">QUICK ACTIONS</p>
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
