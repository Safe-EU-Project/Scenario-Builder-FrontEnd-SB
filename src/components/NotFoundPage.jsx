import { Link } from "react-router-dom";
import { FiArrowLeft, FiMap } from "react-icons/fi";
import "./styles/GuidePage.css";

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <FiMap />
      <p>404 / Route not found</p>
      <h1>This workspace does not exist</h1>
      <span>The page may have moved or the address is incomplete.</span>
      <Link to="/"><FiArrowLeft /> Return to dashboard</Link>
    </div>
  );
}
