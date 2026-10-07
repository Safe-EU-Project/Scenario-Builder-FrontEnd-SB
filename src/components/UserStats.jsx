import PerformancePercentile from "./PerformancePercentile.jsx";
import "./styles/UserStats.css";
import { useRef, useEffect, useState } from "react"; // Add useState
import generatePDF from "react-to-pdf";
import { FaDownload } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { MdIncompleteCircle } from "react-icons/md";
import { RiNumbersFill } from "react-icons/ri";
import PieChartComparison from "./PiechartComparison.jsx";
import apiFetch from "../service/api_client";

const AssignmentStats = () => {
  
  const [userStats, setUserStats] = useState(null);
  const [allUsersData, setAllUsersData] = useState([]);
  const [completedScenarios, setCompletedScenarios] = useState();
  const targetRef = useRef();

  useEffect(() => {
    
    async function fetchAllUserSData() {
      try {
        const response = await apiFetch.get(
          "/v1/assignment/trainee/assignments/analytics",
        );
        const usersData = await response.data;
        console.log(usersData);

        setAllUsersData(usersData);

        // Find me:true user
        const meUser = usersData.find((user) => user.me === true);
        if (meUser) {
          setUserStats({
            current_user: meUser.email,
            average_grade: meUser.average_grade.toFixed(2),
            assignments_completed: meUser.assignments_count,
          });
        }
      } catch (error) {
        console.error("Error fetching exercise", error);
      }
    }
    fetchAllUserSData();

    //console.log("ALL USERS DATA: Fetching");
    async function fetchScenariosCompleted() {
      try {
        const response = await apiFetch.get(
          "/v1/assignment/trainee/scenario/solved"
        );
        const myCompletedScenarios = response.data;
        console.log("Completed:", myCompletedScenarios);

        setCompletedScenarios(myCompletedScenarios);
        
      } catch (error) {
        console.error("Error fetching exercise", error);
      }
    }
    fetchScenariosCompleted();
  }, []);

  const current_user = userStats?.current_user || "Unavailable";
  const average_grade = userStats?.average_grade ?? "—";
  const average_time = "Not tracked";
  const assignments_completed = userStats?.assignments_completed ?? 0;
  const completed= completedScenarios || { solved_by_current_user: 0, total_scenarios: 0 };


  // Data for CumulativePercentile (average_grade values)
  const gradesData = allUsersData.map((user) => user.average_grade);
  const myGrade = allUsersData.find((user) => user.me === true)?.average_grade ?? 0;

  return (
    <div className="outer_assignment_stats">
      <div className="analytics-report" ref={targetRef}>
        <header className="title_assignment_stats">
          <div>
            <span>Performance intelligence</span>
            <h1>User analytics</h1>
            <p>Training completion and performance compared with participating users.</p>
          </div>
          <button
            type="button"
            className="download_button"
            onClick={() => generatePDF(targetRef, { filename: "user_analytics.pdf" })}
            aria-label="Download user analytics as PDF"
          >
            <FaDownload />
            <span>Export PDF</span>
          </button>
        </header>

        <div className="analytics-kpi-grid">
          <article className="analytics-kpi">
            <FaUser />
            <div><span>Current user</span><strong>{current_user}</strong></div>
          </article>
          <article className="analytics-kpi">
            <RiNumbersFill />
            <div><span>Average grade</span><strong>{average_grade}</strong></div>
          </article>
          <article className="analytics-kpi">
            <IoMdTime />
            <div><span>Average time</span><strong>{average_time}</strong></div>
          </article>
          <article className="analytics-kpi">
            <MdIncompleteCircle />
            <div><span>Assignments completed</span><strong>{assignments_completed}</strong></div>
          </article>
        </div>

        <div className="inner_assignment_stats">
          <section className="analytics-panel info_container">
            <div className="analytics-panel-heading">
              <div><span>Completion</span><h2>Exercise coverage</h2></div>
            </div>
            <div className="piechart">
              <PieChartComparison scenariosCompleted={completed} />
            </div>
          </section>

          <section className="analytics-panel chart_container">
            <div className="analytics-panel-heading">
              <div><span>Benchmark</span><h2>Performance percentile</h2></div>
            </div>
            <div className="cumulative_percentile_chart">
              <PerformancePercentile data={gradesData} highlightValue={myGrade} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AssignmentStats;
