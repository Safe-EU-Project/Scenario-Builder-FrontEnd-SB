import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiLoader, FiPlus, FiUsers, FiX } from "react-icons/fi";
import apiFetch from "../service/api_client";
import { ProductButton } from "./ui/ProductUI";
import "./styles/PublishScenarioModal.css";

function PublishScenarioModal({ scenario, onClose, onPublished }) {
  const [scope, setScope] = useState(
    scenario.assignment_scope === "selected" ? "selected" : "all"
  );
  const [trainees, setTrainees] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedTrainees, setSelectedTrainees] = useState(
    new Set(scenario.assignment_targets?.trainee_ids || [])
  );
  const [selectedGroups, setSelectedGroups] = useState(
    new Set(scenario.assignment_targets?.group_ids || [])
  );
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch.get("/v1/user/trainees"),
      apiFetch.get("/v1/user/trainee-groups"),
    ])
      .then(([traineeResponse, groupResponse]) => {
        setTrainees(traineeResponse.data);
        setGroups(groupResponse.data);
      })
      .catch((err) => setError(err.response?.data?.detail || "Could not load trainees."))
      .finally(() => setLoading(false));
  }, []);

  const selectedPeople = useMemo(
    () => trainees.filter((trainee) => selectedTrainees.has(trainee.id)),
    [trainees, selectedTrainees]
  );

  const toggle = (setter, id) => {
    setter((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedPeople.length === 0) {
      setError("Enter a group name and select at least one trainee.");
      return;
    }
    try {
      const response = await apiFetch.post("/v1/user/trainee-groups", {
        name: groupName.trim(),
        member_ids: [...selectedTrainees],
      });
      setGroups((current) => [
        ...current.filter((group) => group.id !== response.data.id),
        response.data,
      ]);
      setSelectedGroups((current) => new Set(current).add(response.data.id));
      setGroupName("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save the group.");
    }
  };

  const publish = async () => {
    if (
      scope === "selected" &&
      selectedTrainees.size === 0 &&
      selectedGroups.size === 0
    ) {
      setError("Select at least one trainee or group.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await apiFetch.post(`/v1/scenario/${scenario._id}/publish`, {
        assign_to_all: scope === "all",
        trainee_ids: [...selectedTrainees],
        group_ids: [...selectedGroups],
      });
      onPublished(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Publication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="publish-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="publish-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span>Distribution controls</span>
            <h2 id="publish-title">Publish scenario</h2>
            <p>{scenario.scenario_name}</p>
          </div>
          <button className="publish-close" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </header>

        <div className="publish-scope">
          <button
            className={scope === "all" ? "active" : ""}
            onClick={() => setScope("all")}
          >
            <FiUsers /><strong>All trainees</strong><span>Available to every registered trainee</span>
          </button>
          <button
            className={scope === "selected" ? "active" : ""}
            onClick={() => setScope("selected")}
          >
            <FiCheck /><strong>Selected audience</strong><span>Assign to specific people or groups</span>
          </button>
        </div>

        {scope === "selected" && (
          <div className="publish-directory">
            {loading ? (
              <div className="publish-loading"><FiLoader /> Loading directory…</div>
            ) : (
              <>
                <section>
                  <div className="publish-section-title">
                    <div><strong>Registered trainees</strong><span>{selectedTrainees.size} selected</span></div>
                  </div>
                  <div className="publish-options">
                    {trainees.length === 0 && <p>No registered trainees found.</p>}
                    {trainees.map((trainee) => (
                      <label key={trainee.id}>
                        <input
                          type="checkbox"
                          checked={selectedTrainees.has(trainee.id)}
                          onChange={() => toggle(setSelectedTrainees, trainee.id)}
                        />
                        <span className="publish-avatar">{trainee.email[0]?.toUpperCase()}</span>
                        <span>{trainee.email}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="publish-section-title">
                    <div><strong>Trainee groups</strong><span>{selectedGroups.size} selected</span></div>
                  </div>
                  <div className="publish-options">
                    {groups.length === 0 && <p>No groups yet. Create one below.</p>}
                    {groups.map((group) => (
                      <label key={group.id}>
                        <input
                          type="checkbox"
                          checked={selectedGroups.has(group.id)}
                          onChange={() => toggle(setSelectedGroups, group.id)}
                        />
                        <FiUsers />
                        <span>{group.name}</span>
                        <small>{group.member_ids.length} members</small>
                      </label>
                    ))}
                  </div>
                  <div className="publish-new-group">
                    <input
                      value={groupName}
                      onChange={(event) => setGroupName(event.target.value)}
                      placeholder="New group name"
                    />
                    <ProductButton onClick={createGroup} disabled={!groupName.trim()}>
                      <FiPlus /> Save selected as group
                    </ProductButton>
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {error && <div className="publish-error">{error}</div>}

        <footer>
          <span>
            {scope === "all"
              ? "Publishes to the full trainee catalog"
              : `${selectedTrainees.size} people and ${selectedGroups.size} groups selected`}
          </span>
          <div>
            <ProductButton onClick={onClose}>Cancel</ProductButton>
            <ProductButton variant="primary" onClick={publish} disabled={submitting || loading}>
              {submitting && <FiLoader className="publish-spin" />}
              Publish & assign
            </ProductButton>
          </div>
        </footer>
      </section>
    </div>
  );
}

export default PublishScenarioModal;
