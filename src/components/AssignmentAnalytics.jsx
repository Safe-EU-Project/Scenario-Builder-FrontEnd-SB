import BarChartGrades from '../BarChartGrades';
import './styles/AssignmentAnalytics.css';
import { FaUser } from "react-icons/fa";
import { RiNumbersFill } from "react-icons/ri";
import { FaElementor } from "react-icons/fa";
import { useRef, useEffect, useState } from 'react';  // Add useState
import generatePDF from 'react-to-pdf';
import { FaDownload } from "react-icons/fa6";

function AssignmentAnalytics({ assignmentData }) {
    const generalInfo = assignmentData.filter((element) => element.me == true);
    const questionsInfo = generalInfo[0];

    if (!questionsInfo) {
        return (
            <div className="assignment_analytics_container">
                <div className='assignment_analytics_header'>Assignment Analytics</div>
                <div style={{ padding: "20px", color: "#9ca3af" }}>No completed assignments to display.</div>
            </div>
        );
    }

    const targetRef = useRef();
    
    return (
        <div className="assignment_analytics_container">
            <div className='assignment_analytics_header' >Assignment Analytics Component <div style={{marginLeft:"15px", color:"black", cursor:"pointer"}} onClick={() => generatePDF(targetRef, { filename: 'assignment_analytics.pdf' })}><FaDownload /></div></div>
            <div className='inner_container' ref={targetRef}>
                    <div style={{display:"flex", alignItems:"center"}}><FaElementor/><b style={{margin:"2px"}}>Scenario Name:</b> {questionsInfo.scenario_name}</div>
                    <div style={{display:"flex", alignItems:"center"}}><RiNumbersFill/><b style={{margin:"2px"}}>Average Grade:</b> {questionsInfo.grade_of_this_attempt != null ? `${Math.round(questionsInfo.grade_of_this_attempt)}/100` : "N/A"}</div>
                    <div style={{display:"flex", alignItems:"center"}}><FaUser/><b style={{margin:"2px"}}> User:</b> {questionsInfo.email}</div>
                    <div className='barchart'><BarChartGrades gradePerIncident={questionsInfo.grade_per_incident}/></div>     
            </div>

        </div>
    );
}


export default AssignmentAnalytics;