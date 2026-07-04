import { useEffect, useRef } from "react";
import generatePDF from "react-to-pdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} from "docx";
import {
  FiX,
  FiDownload,
  FiShield,
  FiAlertTriangle,
  FiSearch,
  FiLock,
  FiDatabase,
  FiTarget,
  FiUsers,
  FiTool,
  FiCheckCircle,
  FiFileText,
  FiList,
  FiRefreshCw,
  FiAlignLeft,
  FiGlobe,
} from "react-icons/fi";
import "./styles/PolicyDraftModal.css";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const likelihoodClass = { HIGH: "risk-high", MEDIUM: "risk-medium", LOW: "risk-low" };

const APP_NAME = import.meta.env.VITE_APP_NAME || "Scenario Builder";

/* ══════════════════════════════════════════════════════════════════════════
   WORD (.docx) EXPORT
   ══════════════════════════════════════════════════════════════════════════ */

function heading1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 120 },
  });
}
function heading2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
  });
}
function body(text) {
  return new Paragraph({
    children: [new TextRun({ text: text || "", size: 22 })],
    spacing: { after: 80 },
  });
}
function leaInput(text) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text || "",
        size: 22,
        bold: true,
        color: "C0392B",
      }),
    ],
    spacing: { after: 60 },
  });
}
function numbered(items = []) {
  return items.map(
    (item, i) =>
      new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true, size: 22 }),
          new TextRun({ text: item, size: 22 }),
        ],
        spacing: { after: 60 },
      })
  );
}
function bulleted(items = []) {
  return items.map(
    (item) =>
      new Paragraph({
        children: [
          new TextRun({ text: "• ", bold: true, size: 22 }),
          new TextRun({ text: item, size: 22 }),
        ],
        spacing: { after: 60 },
      })
  );
}

const TABLE_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
};

function tableHeaderCell(text) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 20, color: "FFFFFF" })],
        alignment: AlignmentType.CENTER,
      }),
    ],
    shading: { type: ShadingType.SOLID, color: "1A3A5C" },
    borders: TABLE_BORDER,
  });
}
function tableCell(text) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: text || "—", size: 20 })],
      }),
    ],
    borders: TABLE_BORDER,
  });
}

function buildDocxSections(draft) {
  const children = [];

  /* ── Cover header ── */
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: draft.classification,
          bold: true,
          size: 18,
          color: "C0392B",
          allCaps: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: draft.document_title, bold: true, size: 32 }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Document ID: SAFE-POL-${new Date().getFullYear()}-001`, size: 20, color: "666666" }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Version: DRAFT 1.0 — pending LEA validation`, size: 20, color: "666666" }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Generated: ${new Date(draft.generated_at).toLocaleString()}`, size: 20, color: "666666" }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Scenario: ${draft.scenario_name}`, size: 20, color: "666666" }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Draft Type: ${draft.draft_type}`, size: 20, color: "666666" }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "AI-Generated Draft — Requires Expert Review Before Operational Adoption",
          bold: true,
          size: 20,
          color: "C0392B",
          italics: true,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  /* ── Section 1 ── */
  if (draft.management_commitment) {
    children.push(
      heading1("1. Statement of Management Commitment"),
      body(draft.management_commitment)
    );
  }

  /* ── Section 2 ── */
  if (draft.purpose_and_scope) {
    children.push(
      heading1("2. Purpose and Scope"),
      body(draft.purpose_and_scope)
    );
  }

  /* ── Section 3 ── */
  if (draft.incident_classification) {
    children.push(
      heading1("3. Incident Classification (Europol/CSIRT Common Taxonomy)"),
      body(draft.incident_classification)
    );
  }

  /* ── Section 4 ── */
  if (draft.executive_summary) {
    children.push(heading1("4. Threat Assessment"));
    const es = draft.executive_summary;
    if (typeof es === 'string') {
      children.push(body(es));
    } else {
      const tp = es?.threat_profile ?? {};
      const se = es?.simulation_evidence ?? {};
      if (Object.keys(tp).length > 0) {
        children.push(heading2("4.1 Threat Profile"));
        Object.entries(tp).forEach(([k, val]) => {
          children.push(body(`${k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ${String(val)}`));
        });
      }
      if (Object.keys(se).length > 0) {
        children.push(heading2("4.2 Simulation Evidence"));
        Object.entries(se).forEach(([k, val]) => {
          const formatted = Array.isArray(val) ? val.join('; ') : String(val);
          children.push(body(`${k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ${formatted}`));
        });
      }
    }
  }

  /* Identified Risks */
  if (draft.identified_risks?.length > 0) {
    children.push(heading2("4.3 Identified Risks"));
    const riskTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            tableHeaderCell("Threat Type"),
            tableHeaderCell("Likelihood"),
            tableHeaderCell("Description"),
          ],
        }),
        ...draft.identified_risks.map(
          (r) =>
            new TableRow({
              children: [
                tableCell(r.threat_type),
                tableCell(r.likelihood),
                tableCell(r.description),
              ],
            })
        ),
      ],
    });
    children.push(riskTable, new Paragraph({ spacing: { after: 160 } }));
  }

  /* ── Section 5 ── */
  children.push(heading1("5. Mandatory Response Procedures"));

  if (draft.detection_procedures?.length > 0) {
    children.push(heading2("5.1 Detection and Initial Assessment (T+0 to T+30 min)"));
    children.push(...numbered(draft.detection_procedures));
  }

  if (draft.containment_procedures?.length > 0) {
    children.push(heading2("5.2 Containment (T+30 min to T+2 hours)"));
    children.push(...numbered(draft.containment_procedures));
  }

  if (draft.evidence_preservation_steps?.length > 0) {
    children.push(
      heading2("5.3 Evidence Preservation"),
      new Paragraph({
        children: [
          new TextRun({
            text: "⚠ All steps below MUST be completed BEFORE any remediation or system restoration.",
            bold: true,
            size: 22,
            color: "8B5CF6",
          }),
        ],
        spacing: { after: 80 },
      }),
      ...numbered(draft.evidence_preservation_steps)
    );
  }

  /* Escalation Chain */
  if (draft.escalation_chain?.length > 0) {
    children.push(heading2("5.4 Escalation Chain"));
    const escTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            tableHeaderCell("Level"),
            tableHeaderCell("Trigger"),
            tableHeaderCell("Notify"),
            tableHeaderCell("Timeframe"),
          ],
        }),
        ...draft.escalation_chain.map(
          (e) =>
            new TableRow({
              children: [
                tableCell(e.level),
                tableCell(e.trigger),
                tableCell(e.notify),
                tableCell(e.timeframe),
              ],
            })
        ),
      ],
    });
    children.push(escTable, new Paragraph({ spacing: { after: 160 } }));
  }

  /* External Reporting */
  if (draft.external_reporting_obligations?.length > 0) {
    children.push(heading2("5.5 External Reporting Obligations"));
    const repTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            tableHeaderCell("Reporting Body"),
            tableHeaderCell("Legal Basis"),
            tableHeaderCell("Obligation"),
            tableHeaderCell("Deadline"),
          ],
        }),
        ...draft.external_reporting_obligations.map(
          (r) =>
            new TableRow({
              children: [
                tableCell(r.body),
                tableCell(r.legal_basis),
                tableCell(r.obligation),
                tableCell(r.deadline),
              ],
            })
        ),
      ],
    });
    children.push(repTable, new Paragraph({ spacing: { after: 160 } }));
  }

  /* ── Section 6 ── */
  children.push(heading1("6. Preventive Controls"));
  if (draft.preventive_controls?.length > 0) {
    children.push(heading2("6.1 Technical Controls"));
    children.push(...bulleted(draft.preventive_controls));
  }
  if (draft.administrative_controls?.length > 0) {
    children.push(heading2("6.2 Administrative Controls"));
    children.push(...bulleted(draft.administrative_controls));
  }

  /* ── Section 7 ── */
  if (draft.roles_and_responsibilities?.length > 0) {
    children.push(heading1("7. Roles and Responsibilities"));
    const rolesTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            tableHeaderCell("Role"),
            tableHeaderCell("Responsibilities"),
          ],
        }),
        ...draft.roles_and_responsibilities.map(
          (r) =>
            new TableRow({
              children: [
                tableCell(r.role),
                tableCell(r.responsibilities),
              ],
            })
        ),
      ],
    });
    children.push(rolesTable, new Paragraph({ spacing: { after: 160 } }));
  }

  /* ── Section 8 ── */
  if (draft.resource_requirements?.length > 0 || draft.policy_recommendations?.length > 0) {
    children.push(heading1("8. Resource Requirements and Policy Recommendations"));
    if (draft.resource_requirements?.length > 0) {
      children.push(heading2("8.1 Resource Requirements"));
      children.push(...bulleted(draft.resource_requirements));
    }
    if (draft.policy_recommendations?.length > 0) {
      children.push(heading2("8.2 Policy Recommendations"));
      draft.policy_recommendations.forEach((rec, i) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${i + 1}. ${rec.policy_title}`, bold: true, size: 22 }),
              new TextRun({ text: `  [${rec.target_audience}]`, size: 20, color: "2980B9" }),
            ],
            spacing: { before: 80, after: 40 },
          }),
          body(rec.rationale)
        );
      });
    }
  }

  /* ── Section 9 ── */
  if (draft.review_cycle?.length > 0) {
    children.push(heading1("9. Review and Update Cycle"));
    children.push(...bulleted(draft.review_cycle));
  }

  /* ── Footer ── */
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Auto-generated by ${APP_NAME} — ${draft.generated_at} — DRAFT: pending LEA expert validation`,
          size: 18,
          color: "999999",
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  return children;
}

async function downloadDocx(draft) {
  const doc = new Document({
    sections: [
      {
        children: buildDocxSections(draft),
      },
    ],
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22, color: "1A1A1A" },
        },
      },
    },
  });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `policy_draft_${draft.scenario_name.replace(/\s+/g, "_").slice(0, 50)}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════════════════════════════
   UI SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════════════════ */

function Section({ icon: Icon, label, accent, children }) {
  return (
    <div className="pd-section" style={{ borderLeftColor: accent }}>
      <h3 className="pd-section-title" style={{ color: accent }}>
        {Icon && <Icon />}
        {label}
      </h3>
      {children}
    </div>
  );
}

function NumberedList({ items = [] }) {
  return (
    <ol className="pd-ordered-list">
      {items.map((item, i) => (
        <li key={i}>
          <span className="pd-step-num">{i + 1}</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function BulletList({ items = [] }) {
  return (
    <ul className="pd-bullet-list">
      {items.map((item, i) => {
        const isCritical = item.startsWith("CRITICAL");
        const isHigh = item.startsWith("HIGH");
        const cls = isCritical ? "pd-bullet-critical" : isHigh ? "pd-bullet-high" : "";
        return (
          <li key={i} className={cls}>
            {item}
          </li>
        );
      })}
    </ul>
  );
}

function EscalationTable({ chain = [] }) {
  if (!chain.length) return null;
  return (
    <div className="pd-table-wrapper">
      <table className="pd-table">
        <thead>
          <tr>
            <th>Level</th>
            <th>Trigger</th>
            <th>Notify</th>
            <th>Timeframe</th>
          </tr>
        </thead>
        <tbody>
          {chain.map((e, i) => (
            <tr key={i} className={e.notify?.includes("LEA INPUT") ? "pd-row-input" : ""}>
              <td><span className="pd-level-badge">{e.level}</span></td>
              <td>{e.trigger}</td>
              <td className={e.notify?.includes("LEA INPUT") ? "pd-lea-input" : ""}>{e.notify}</td>
              <td>{e.timeframe}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportingTable({ obligations = [] }) {
  if (!obligations.length) return null;
  return (
    <div className="pd-table-wrapper">
      <table className="pd-table">
        <thead>
          <tr>
            <th>Reporting Body</th>
            <th>Legal Basis</th>
            <th>Obligation</th>
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          {obligations.map((r, i) => (
            <tr key={i} className={r.body?.includes("LEA INPUT") ? "pd-row-input" : ""}>
              <td className={r.body?.includes("LEA INPUT") ? "pd-lea-input" : ""}>{r.body}</td>
              <td>{r.legal_basis}</td>
              <td>{r.obligation}</td>
              <td><span className="pd-deadline-badge">{r.deadline}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RolesTable({ roles = [] }) {
  if (!roles.length) return null;
  return (
    <div className="pd-table-wrapper">
      <table className="pd-table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Responsibilities</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r, i) => (
            <tr key={i}>
              <td>
                <span className="pd-role-name">
                  {r.role}
                </span>
              </td>
              <td>{r.responsibilities}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN MODAL
   ══════════════════════════════════════════════════════════════════════════ */

export default function PolicyDraftModal({ draft, onClose }) {
  const printRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handlePdf = () =>
    generatePDF(printRef, {
      filename: `policy_draft_${draft.scenario_name.replace(/\s+/g, "_").slice(0, 50)}.pdf`,
      page: { margin: 10 },
    });

  return (
    <div className="pd-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pd-modal">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="pd-header">
          <div className="pd-header-left">
            <FiShield className="pd-header-icon" />
            <div>
              <p className="pd-classification">{draft.classification}</p>
              <h2 className="pd-document-title">{draft.document_title}</h2>
            </div>
          </div>
          <div className="pd-header-actions">
            <button className="pd-btn pd-btn--download" onClick={handlePdf} title="Download PDF">
              <FiDownload /> PDF
            </button>
            <button className="pd-btn pd-btn--word" onClick={() => downloadDocx(draft)} title="Download Word (.docx)">
              <FiFileText /> Word
            </button>
            <button className="pd-btn pd-btn--close" onClick={onClose} title="Close">
              <FiX />
            </button>
          </div>
        </div>

        {/* ── Metadata strip ───────────────────────────────────────── */}
        <div className="pd-meta-strip">
          <span><strong>Scenario:</strong> {draft.scenario_name}</span>
          <span className={`pd-draft-type pd-draft-type--${draft.draft_type}`}>
            {draft.draft_type === "evidence-based" ? "Evidence-Based Draft" : "Threat-Based Draft"}
          </span>
          {draft.simulations_used > 0 && (
            <span><strong>Simulation Runs:</strong> {draft.simulations_used}</span>
          )}
          <span><strong>Generated:</strong> {new Date(draft.generated_at).toLocaleString()}</span>
          {draft.used_fallback && <span className="pd-fallback-badge">⚠ Fallback Draft</span>}
        </div>

        {/* ── AI Disclaimer banner ─────────────────────────────────── */}
        <div className="pd-disclaimer">
          <FiAlertTriangle className="pd-disclaimer-icon" />
          <div>
            <strong>AI-Generated Draft — Requires Expert Review</strong>
            <p>
              This document was automatically generated by {APP_NAME} using an LLM grounded in
              NIST SP 800-61r3, LEERP, and the Europol Common Taxonomy. All legal references,
              deadlines, role titles, and procedures <strong>must be verified</strong> by a
              qualified LEA cybersecurity officer and legal counsel before operational adoption.
            </p>
          </div>
        </div>

        {/* ── Validation Warnings ───────────────────────────────────── */}
        {draft.validation_warnings && draft.validation_warnings.length > 0 && (
          <div className="pd-warnings-panel">
            <div className="pd-warnings-title">
              <FiAlertTriangle /> Automated Review Flags ({draft.validation_warnings.length})
            </div>
            <ul className="pd-warnings-list">
              {draft.validation_warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Printable body ───────────────────────────────────────── */}
        <div className="pd-body" ref={printRef}>

          {/* § 1 — Management Commitment */}
          {draft.management_commitment && (
            <Section icon={FiAlignLeft} label="1. Statement of Management Commitment" accent="#e11d48">
              <p className="pd-prose">{draft.management_commitment}</p>
            </Section>
          )}

          {/* § 2 — Purpose & Scope */}
          {draft.purpose_and_scope && (
            <Section icon={FiList} label="2. Purpose and Scope" accent="#7c3aed">
              <p className="pd-prose">{draft.purpose_and_scope}</p>
            </Section>
          )}

          {/* § 3 — Incident Classification */}
          {draft.incident_classification && (
            <Section icon={FiGlobe} label="3. Incident Classification (Europol/CSIRT Taxonomy)" accent="#0891b2">
              <p className="pd-prose">{draft.incident_classification}</p>
            </Section>
          )}

          {/* § 4 — Threat Assessment */}
          {draft.executive_summary && (
            <Section icon={FiTarget} label="4. Threat Assessment" accent="var(--color-primary)">
              {typeof draft.executive_summary === 'string'
                ? <p className="pd-prose" style={{ whiteSpace: 'pre-line' }}>{draft.executive_summary}</p>
                : (() => {
                    const tp = draft.executive_summary?.threat_profile ?? {};
                    const se = draft.executive_summary?.simulation_evidence ?? {};
                    return (
                      <>
                        {Object.keys(tp).length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <p className="pd-label" style={{ fontWeight: 600, marginBottom: '0.4rem' }}>4.1 Threat Profile</p>
                            {Object.entries(tp).map(([k, val]) => (
                              <p key={k} className="pd-prose" style={{ margin: '0.2rem 0' }}>
                                <strong>{k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</strong> {String(val)}
                              </p>
                            ))}
                          </div>
                        )}
                        {Object.keys(se).length > 0 && (
                          <div>
                            <p className="pd-label" style={{ fontWeight: 600, marginBottom: '0.4rem' }}>4.2 Simulation Evidence</p>
                            {Object.entries(se).map(([k, val]) => (
                              <p key={k} className="pd-prose" style={{ margin: '0.2rem 0' }}>
                                <strong>{k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</strong>{' '}
                                {Array.isArray(val) ? val.join('; ') : String(val)}
                              </p>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()
              }
            </Section>
          )}

          {/* Identified Risks */}
          {draft.identified_risks?.length > 0 && (
            <Section icon={FiAlertTriangle} label="4.3 Identified Risks" accent="var(--color-danger)">
              <div className="pd-risks-grid">
                {draft.identified_risks.map((risk, i) => (
                  <div key={i} className="pd-risk-card">
                    <div className="pd-risk-header">
                      <span className="pd-risk-title">{risk.threat_type}</span>
                      <span className={`pd-risk-badge ${likelihoodClass[risk.likelihood] || ""}`}>
                        {risk.likelihood}
                      </span>
                    </div>
                    <p className="pd-risk-desc">{risk.description}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* § 5 — Response Procedures */}
          <div className="pd-columns">
            {draft.detection_procedures?.length > 0 && (
              <Section icon={FiSearch} label="5.1 Detection Procedures" accent="var(--color-info)">
                <p className="pd-time-label">T+0 to T+30 min</p>
                <NumberedList items={draft.detection_procedures} />
              </Section>
            )}
            {draft.containment_procedures?.length > 0 && (
              <Section icon={FiLock} label="5.2 Containment Procedures" accent="var(--color-warning)">
                <p className="pd-time-label">T+30 min to T+2 hours</p>
                <NumberedList items={draft.containment_procedures} />
              </Section>
            )}
          </div>

          {draft.evidence_preservation_steps?.length > 0 && (
            <Section icon={FiDatabase} label="5.3 Evidence Preservation" accent="#a855f7">
              <p className="pd-notice">⚠ ALL steps below MUST be completed BEFORE any remediation or system restoration.</p>
              <NumberedList items={draft.evidence_preservation_steps} />
            </Section>
          )}

          {/* § 5.4 — Escalation Chain */}
          {draft.escalation_chain?.length > 0 && (
            <Section icon={FiAlertTriangle} label="5.4 Escalation Chain" accent="#f59e0b">
              <EscalationTable chain={draft.escalation_chain} />
            </Section>
          )}

          {/* § 5.5 — External Reporting */}
          {draft.external_reporting_obligations?.length > 0 && (
            <Section icon={FiGlobe} label="5.5 External Reporting Obligations" accent="#06b6d4">
              <ReportingTable obligations={draft.external_reporting_obligations} />
            </Section>
          )}

          {/* § 6 — Preventive Controls */}
          {(draft.preventive_controls?.length > 0 || draft.administrative_controls?.length > 0) && (
            <Section icon={FiShield} label="6. Preventive Controls" accent="var(--color-success)">
              {draft.preventive_controls?.length > 0 && (
                <>
                  <p className="pd-sub-label">6.1 Technical Controls</p>
                  <BulletList items={draft.preventive_controls} />
                </>
              )}
              {draft.administrative_controls?.length > 0 && (
                <>
                  <p className="pd-sub-label" style={{ marginTop: "14px" }}>6.2 Administrative Controls</p>
                  <BulletList items={draft.administrative_controls} />
                </>
              )}
            </Section>
          )}

          {/* § 7 — Roles */}
          {draft.roles_and_responsibilities?.length > 0 && (
            <Section icon={FiUsers} label="7. Roles and Responsibilities" accent="#8b5cf6">
              <RolesTable roles={draft.roles_and_responsibilities} />
            </Section>
          )}

          {/* § 8 — Resources & Recommendations */}
          {(draft.resource_requirements?.length > 0 || draft.policy_recommendations?.length > 0) && (
            <>
              {draft.resource_requirements?.length > 0 && (
                <Section icon={FiTool} label="8. Resource Requirements" accent="var(--color-text-secondary)">
                  <BulletList items={draft.resource_requirements} />
                </Section>
              )}
              {draft.policy_recommendations?.length > 0 && (
                <Section icon={FiCheckCircle} label="Policy Recommendations" accent="var(--color-primary)">
                  <div className="pd-recs-grid">
                    {draft.policy_recommendations.map((rec, i) => (
                      <div key={i} className="pd-rec-card">
                        <div className="pd-rec-header">
                          <span className="pd-rec-number">{String(i + 1).padStart(2, "0")}</span>
                          <div>
                            <h4 className="pd-rec-title">{rec.policy_title}</h4>
                            <span className="pd-rec-audience">{rec.target_audience}</span>
                          </div>
                        </div>
                        <p className="pd-rec-rationale">{rec.rationale}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}

          {/* § 9 — Review Cycle */}
          {draft.review_cycle?.length > 0 && (
            <Section icon={FiRefreshCw} label="9. Review and Update Cycle" accent="#10b981">
              <BulletList items={draft.review_cycle} />
            </Section>
          )}

        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="pd-footer">
          <span>{APP_NAME} · Policy Draft · {new Date(draft.generated_at).toLocaleDateString()}</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="pd-btn pd-btn--download" onClick={handlePdf}>
              <FiDownload /> PDF
            </button>
            <button className="pd-btn pd-btn--word" onClick={() => downloadDocx(draft)}>
              <FiFileText /> Word
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
