import CumulativePercentile from "./CumulativePercentile.jsx";
import "./styles/UserStats.css";
import { useRef, useEffect, useState } from "react"; // Add useState
import generatePDF from "react-to-pdf";
import { FaDownload } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { MdIncompleteCircle } from "react-icons/md";
import { RiNumbersFill } from "react-icons/ri";
import PieChartComparison from "./PiechartComparison.jsx";
import { TOKENS } from "./config/config.js";
import apiFetch from "../service/api_client";

const AssignmentStats = ({ data, highlightValue }) => {
  
  const [userStats, setUserStats] = useState(null);
  const [allUsersData, setAllUsersData] = useState([]);
  const [completedScenarios, setCompletedScenarios] = useState();
  const targetRef = useRef();

  useEffect(() => {
    
    async function fetchAllUserSData() {
      try {
        // const response = await fetch(
        //   "http://localhost:8000/api/v1/assignment/user/assignments/analytics",
        //   {
        //     headers: {
        //       Authorization: `Bearer ${TOKENS.bearer}`,
        //     },
        //   },
        // );
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

  // Calculate total assignments
  const assignments_completed_total = allUsersData.reduce(
    (sum, user) => sum + user.assignments_count,
    0,
  );

  const current_user = userStats?.current_user || "trial@email.com";
  const average_grade = userStats?.average_grade || "73%"; //(fix)
  const average_time = "2h 30m"; // Hardcoded // (fix)
  const assignments_completed = userStats?.assignments_completed || "15";
  const completed= completedScenarios || { solved_by_current_user: 0, total_scenarios: 0 };


  // Data for CumulativePercentile (average_grade values)
  const gradesData = allUsersData.map((user) => user.average_grade);
  const myGrade =
    allUsersData.find((user) => user.me === true)?.average_grade ||
    highlightValue;

  return (
    <div className="outer_assignment_stats">
      <div className="title_assignment_stats" ref={targetRef}>
        User Overall Statistics
        <div
          className="download_button"
          onClick={() =>
            generatePDF(targetRef, { filename: "user_analytics.pdf" })
          }
        >
          <FaDownload />
        </div>
      </div>
      <div className="inner_assignment_stats" ref={targetRef}>
        <div className="info_container">
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <FaUser />{" "}
              <b style={{ margin: "0rem 0.4rem 0rem 1rem" }}>Current User: </b>
              {current_user}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <RiNumbersFill />{" "}
              <b style={{ margin: "0rem 0.4rem 0rem 1rem" }}>Average Grade: </b>
              {average_grade}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <IoMdTime />{" "}
              <b style={{ margin: "0rem 0.4rem 0rem 1rem" }}>Average Time: </b>
              {average_time}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <MdIncompleteCircle />{" "}
              <b style={{ margin: "0rem 0.4rem 0rem 1rem" }}>
                Assignments Completed:{" "}
              </b>
              {assignments_completed}
            </div>
          </div>
          <div className='piechart'>
            <PieChartComparison scenariosCompleted={completed}  />
          </div>
        </div>

        <div className='chart_container'>
          <div className='cumulative_percentile_chart'>
            <CumulativePercentile data={gradesData} highlightValue={average_grade} scenariosCompleted={completedScenarios} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentStats;
