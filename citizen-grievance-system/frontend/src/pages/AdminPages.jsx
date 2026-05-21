import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Field,
  Icon,
  SidebarLayout,
  StatCard,
  Table,
  inputClass,
} from "../components/ui";
import LiveMap from "../components/LiveMap";
import LocationPicker from "../components/LocationPicker";
import { api, resolveMediaUrl } from "../lib/api";
import { formatDateTime, priorityTone, sortByPriority, statusTone } from "../lib/format";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: "dashboard" },
  { to: "/admin/complaints", label: "Complaints", icon: "list_alt" },
  { to: "/admin/rejected", label: "AI Rejections", icon: "block" },
  { to: "/admin/review-requests", label: "Review Requests", icon: "fact_check" },
  { to: "/admin/resolved", label: "Resolved", icon: "check_circle" },
  { to: "/admin/manual-review", label: "Manual Review", icon: "fact_check" },
  { to: "/admin/active-work", label: "Active Work", icon: "construction" },
  { to: "/admin/escalations", label: "Escalations", icon: "priority_high" },
  { to: "/admin/users", label: "Users", icon: "group" },
  { to: "/admin/analytics", label: "Analytics", icon: "monitoring" },
  { to: "/admin/settings", label: "Settings", icon: "settings" },
];

function AdminShell({ children }) {
  return (
    <SidebarLayout title="Admin Portal" subtitle="Grievance Division" navItems={adminNav}>
      {children}
    </SidebarLayout>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [activeWorks, setActiveWorks] = useState([]);

  useEffect(() => {
    api.dashboardStats().then(setStats).catch(() => setStats({}));
    api.listComplaints().then((data) => setComplaints(sortByPriority((data.results || []).map(mapComplaint)))).catch(() => setComplaints([]));
    api.listActiveWork().then((data) => setActiveWorks((data.results || []).map(mapActiveWork))).catch(() => setActiveWorks([]));
  }, []);

  return (
    <AdminShell>
      <PageHeader
        title="Overview Dashboard"
        subtitle="System state for complaints, active work, SLA, and routing."
        action={<Button variant="secondary"><Icon name="download" />Export Report</Button>}
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Complaints" value={stats?.total_complaints ?? 0} icon="folder" />
        <StatCard label="Pending" value={stats?.pending_complaints ?? 0} icon="schedule" tone="secondary" />
        <StatCard label="High Priority" value={stats?.high_priority ?? 0} icon="priority_high" tone="amber" />
        <StatCard label="Overdue" value={stats?.overdue ?? 0} icon="warning" tone="red" />
        <StatCard label="Escalated" value={stats?.escalated ?? 0} icon="bolt" tone="red" />
        <StatCard label="Auto-Responded" value={stats?.auto_responded ?? 0} icon="smart_toy" tone="secondary" />
        <StatCard label="Rejected by AI" value={stats?.rejected ?? 0} icon="block" tone="red" />
        <StatCard label="Multi-Dept" value={stats?.multi_department ?? 0} icon="account_tree" tone="secondary" />
      </div>
      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="p-6 xl:col-span-8">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">Daily Complaint Trend</h2>
          <div className="flex h-64 items-end gap-3 border-b border-l border-border px-4 pt-6">
            {buildChartValues(stats?.by_status).map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t bg-secondary" style={{ height }} />
                <span className="text-xs text-text-muted">{index + 1}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 xl:col-span-4">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">Priority Distribution</h2>
          <div className="space-y-4">
            {[
              ["Critical", `${stats?.by_priority?.Critical ?? 0}`, "bg-danger"],
              ["High", `${stats?.by_priority?.High ?? 0}`, "bg-warning"],
              ["Medium", `${stats?.by_priority?.Medium ?? 0}`, "bg-secondary"],
              ["Low", `${stats?.by_priority?.Low ?? 0}`, "bg-slate-400"],
            ].map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-primary">{label}</span>
                  <span className="text-text-muted">{value}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-soft">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(Number(value) * 10, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ComplaintMiniTable title="Recent High Priority Complaints" rows={complaints.slice(0, 3)} />
        <ActiveWorkMiniTable rows={activeWorks} />
      </div>
    </AdminShell>
  );
}

export function ComplaintsQueuePage() {
  const [complaints, setComplaints] = useState([]);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: "",
    category: "",
    priority: "",
    ward: "",
  });
  useEffect(() => {
    const effectiveFilters = { ...filters, search: filters.search || searchParams.get("search") || "" };
    api.listComplaints(effectiveFilters).then((data) => {
      const hiddenStatuses = new Set(["resolved", "closed", "resolution_review", "false_review", "rejected"]);
      const rows = (data.results || []).map(mapComplaint).filter((item) => !hiddenStatuses.has(item.rawStatus));
      setComplaints(sortByPriority(rows));
    }).catch(() => setComplaints([]));
  }, [filters, searchParams]);
  const columns = [
    { key: "id", label: "Complaint ID" },
    { key: "citizen", label: "Citizen Mobile" },
    { key: "complaintForLabel", label: "For" },
    { key: "affectedContact", label: "Affected Contact" },
    { key: "category", label: "Category" },
    { key: "confidence", label: "Confidence", render: (row) => `${row.confidence}%` },
    { key: "priority", label: "Priority", render: (row) => <Badge tone={priorityTone(row.priority)}>{row.priority}</Badge> },
    { key: "proof", label: "Proof", render: (row) => (row.hasCitizenProof ? <Badge tone="green">Uploaded</Badge> : <Badge>None</Badge>) },
    { key: "location", label: "Location" },
    { key: "status", label: "Status", render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    { key: "eta", label: "ETA/SLA" },
  ];
  return (
    <AdminShell>
      <PageHeader title="Complaint Queue" subtitle="Filter, review, reassign, escalate, and mark verified false complaints." />
      <ComplaintFilters filters={filters} onChange={setFilters} />
      {complaints.length === 0 ? <EmptyState title="No complaints found" message="Complaint records from MongoDB will appear here." /> : <Table
        columns={columns}
        rows={complaints}
        renderActions={(row) => (
          <Link className="font-semibold text-secondary hover:underline" to={`/admin/complaints/${row.id}`}>
            View
          </Link>
        )}
      />}
    </AdminShell>
  );
}

export function AdminReviewRequestsPage() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");

  async function loadReviewRequests() {
    try {
      const [falseData, resolutionData] = await Promise.all([
        api.listComplaints({ status: "false_review", limit: 100 }),
        api.listComplaints({ status: "resolution_review", limit: 100 }),
      ]);
      const rows = [...(falseData.results || []), ...(resolutionData.results || [])].map(mapComplaint);
      setComplaints(sortByPriority(rows));
    } catch (error) {
      setComplaints([]);
      setMessage(error.message || "Could not load review requests.");
    }
  }

  useEffect(() => {
    loadReviewRequests();
  }, []);

  async function approve(row) {
    setMessage("");
    try {
      if (row.rawStatus === "false_review") {
        await api.approveFalseReport(row.id, "Admin approved worker camera evidence as a false complaint.");
        setMessage("False complaint approved. It was removed from citizen, admin, and worker complaint lists; citizen was notified.");
      } else {
        await api.approveResolution(row.id, "Admin approved worker resolution photo evidence.");
        setMessage("Resolution approved. It moved out of active complaints and into the resolved page.");
      }
      await loadReviewRequests();
    } catch (error) {
      setMessage(error.message || "Could not approve this request.");
    }
  }

  const columns = [
    { key: "id", label: "Complaint ID" },
    { key: "citizen", label: "Citizen" },
    { key: "category", label: "Department" },
    { key: "priority", label: "Priority", render: (row) => <Badge tone={priorityTone(row.priority)}>{row.priority}</Badge> },
    { key: "status", label: "Review Type", render: (row) => <Badge tone={row.rawStatus === "false_review" ? "red" : "green"}>{row.status}</Badge> },
    { key: "proof", label: "Evidence", render: (row) => `${row.workerFalseEvidenceCount + row.resolutionEvidenceCount} file(s)` },
    { key: "location", label: "Location" },
  ];

  return (
    <AdminShell>
      <PageHeader title="Review Requests" subtitle="Approve worker-submitted false-report and resolution evidence before final action." />
      {message ? <p className="mb-4 rounded-md border border-border bg-surface-soft p-3 text-sm text-text-muted">{message}</p> : null}
      {complaints.length === 0 ? (
        <EmptyState title="No review requests" message="Worker false-report and resolution requests will appear here after photo verification." />
      ) : (
        <Table
          columns={columns}
          rows={complaints}
          renderActions={(row) => (
            <div className="flex flex-wrap gap-3">
              <Link className="font-semibold text-secondary hover:underline" to={`/admin/complaints/${row.id}`}>
                View
              </Link>
              <button className="font-semibold text-primary hover:underline" type="button" onClick={() => approve(row)}>
                {row.rawStatus === "false_review" ? "Approve False" : "Approve Resolved"}
              </button>
            </div>
          )}
        />
      )}
    </AdminShell>
  );
}

export function AdminResolvedPage() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    api
      .listComplaints({ status: "resolved", limit: 100 })
      .then((data) => setComplaints(sortByPriority((data.results || []).map(mapComplaint))))
      .catch(() => setComplaints([]));
  }, []);

  const columns = [
    { key: "id", label: "Complaint ID" },
    { key: "citizen", label: "Citizen" },
    { key: "category", label: "Department" },
    { key: "priority", label: "Priority", render: (row) => <Badge tone={priorityTone(row.priority)}>{row.priority}</Badge> },
    { key: "location", label: "Location" },
    { key: "submittedAt", label: "Submitted" },
    { key: "status", label: "Status", render: (row) => <Badge tone="green">{row.status}</Badge> },
  ];

  return (
    <AdminShell>
      <PageHeader title="Resolved Complaints" subtitle="Complaints approved by admin after worker photo verification." />
      {complaints.length === 0 ? (
        <EmptyState title="No resolved complaints" message="Approved resolutions will be archived here for admin records." />
      ) : (
        <Table
          columns={columns}
          rows={complaints}
          renderActions={(row) => (
            <Link className="font-semibold text-secondary hover:underline" to={`/admin/complaints/${row.id}`}>
              View
            </Link>
          )}
        />
      )}
    </AdminShell>
  );
}
export function AIRejectionsPage() {
  const [complaints, setComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);

  useEffect(() => {
    api
      .listComplaints({ status: "rejected", limit: 100 })
      .then((data) => setComplaints((data.results || []).map(mapComplaint)))
      .catch(() => setComplaints([]));
    api
      .listComplaints({ limit: 100 })
      .then((data) => setAllComplaints((data.results || []).map(mapComplaint)))
      .catch(() => setAllComplaints([]));
  }, []);

  const multiDepartment = allComplaints.filter((item) => item.aiDepartments.length > 1);
  const translated = allComplaints.filter((item) => item.translationSource && item.translationSource !== "backend_fallback");
  const avgValidity = complaints.length
    ? Math.round((complaints.reduce((sum, item) => sum + item.validityConfidence, 0) / complaints.length) * 100)
    : 0;
  const columns = [
    { key: "id", label: "Complaint ID" },
    { key: "citizen", label: "Citizen" },
    { key: "text", label: "Rejected Text", render: (row) => <span className="line-clamp-2">{row.text}</span> },
    { key: "validity", label: "Validity", render: (row) => `${Math.round(row.validityConfidence * 100)}% invalid` },
    { key: "language", label: "Language" },
    { key: "reason", label: "AI Reason", render: (row) => row.rejectionReason || "Outside government scope" },
    { key: "submittedAt", label: "Submitted" },
  ];

  return (
    <AdminShell>
      <PageHeader
        title="AI Rejections"
        subtitle="Showcase how the model filters fake, private, spam, and non-government complaints before routing."
      />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Rejected" value={complaints.length} icon="block" tone="red" />
        <StatCard label="Avg Validity Confidence" value={`${avgValidity}%`} icon="verified" tone="amber" />
        <StatCard label="Multi-Dept Detected" value={multiDepartment.length} icon="account_tree" tone="secondary" />
        <StatCard label="Language Processed" value={translated.length} icon="translate" tone="secondary" />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">What The AI Filters</h2>
          <div className="space-y-3 text-sm text-text-muted">
            <p><span className="font-semibold text-primary">Private issues:</span> fan, AC, TV remote, personal internet, landlord/shop disputes.</p>
            <p><span className="font-semibold text-primary">Spam or manipulation:</span> viral threats, cash prize links, fake emergency claims.</p>
            <p><span className="font-semibold text-primary">Routing protection:</span> rejected complaints are not assigned to civic departments.</p>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">Multi-Department Proof</h2>
          <div className="space-y-3">
            {multiDepartment.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-md border border-border p-3">
                <p className="font-mono text-sm font-semibold text-primary">{item.id}</p>
                <p className="mt-1 text-sm text-text-muted">{item.aiDepartments.join(" + ")}</p>
              </div>
            ))}
            {multiDepartment.length === 0 ? <p className="text-sm text-text-muted">Multi-department predictions will appear after new AI model submissions.</p> : null}
          </div>
        </Card>
      </div>

      {complaints.length === 0 ? (
        <EmptyState title="No rejected complaints yet" message="Submit fake/private examples after the new AI model is running to show this page in action." />
      ) : (
        <Table
          columns={columns}
          rows={complaints}
          renderActions={(row) => (
            <Link className="font-semibold text-secondary hover:underline" to={`/admin/complaints/${row.id}`}>
              View
            </Link>
          )}
        />
      )}
    </AdminShell>
  );
}

export function AdminComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [falseNote, setFalseNote] = useState("");
  const [falseEvidence, setFalseEvidence] = useState([]);
  const [actionMessage, setActionMessage] = useState("");
  const [responseForm, setResponseForm] = useState({
    responseMessage: "",
    etaHours: "",
    status: "in_progress",
  });
  useEffect(() => {
    api.getComplaint(id).then((data) => setComplaint(mapComplaint(data.complaint))).catch(() => setComplaint(null));
  }, [id]);

  async function refreshComplaint() {
    const data = await api.getComplaint(id);
    setComplaint(mapComplaint(data.complaint));
  }

  async function testEscalation() {
    setActionMessage("");
    try {
      await api.escalateComplaint(id, "higher_authority");
      await refreshComplaint();
      setActionMessage("Complaint escalated for testing. Citizen notification and timeline were updated.");
    } catch (error) {
      setActionMessage(error.message || "Could not escalate complaint.");
    }
  }

  async function markFalse() {
    setActionMessage("");
    if (!falseNote.trim()) {
      setActionMessage("Add a verification note before marking this complaint false.");
      return;
    }
    if (!falseEvidence.length && !complaint.workerFalseEvidenceCount) {
      setActionMessage("Upload evidence, or review worker-submitted camera evidence before marking this complaint false.");
      return;
    }
    try {
      await api.markFalseComplaint(id, falseNote.trim(), falseEvidence);
      await refreshComplaint();
      setFalseEvidence([]);
      setActionMessage("Complaint marked false after validation. Citizen false-count was updated.");
    } catch (error) {
      setActionMessage(error.message || "Could not mark complaint false.");
    }
  }

  async function approveWorkerFalseReport() {
    setActionMessage("");
    try {
      await api.approveFalseReport(id, "Admin approved worker camera evidence as a false complaint.");
      navigate("/admin/review-requests");
    } catch (error) {
      setActionMessage(error.message || "Could not approve false-report request.");
    }
  }

  async function approveWorkerResolution() {
    setActionMessage("");
    try {
      await api.approveResolution(id, "Admin approved worker resolution photo evidence.");
      await refreshComplaint();
      setActionMessage("Resolution approved and moved to resolved records.");
    } catch (error) {
      setActionMessage(error.message || "Could not approve resolution request.");
    }
  }
  async function submitAdminResponse(event) {
    event.preventDefault();
    setActionMessage("");
    if (!responseForm.responseMessage.trim()) {
      setActionMessage("Write a response before sending it to the citizen.");
      return;
    }
    try {
      await api.sendAdminResponse(id, {
        response_message: responseForm.responseMessage.trim(),
        estimated_resolution_hours: responseForm.etaHours,
        status: responseForm.status,
      });
      await refreshComplaint();
      setResponseForm({ responseMessage: "", etaHours: "", status: "in_progress" });
      setActionMessage("Response sent. ETA/status and citizen notification were updated.");
    } catch (error) {
      setActionMessage(error.message || "Could not send response.");
    }
  }

  if (!complaint) {
    return <AdminShell><EmptyState title="Complaint not found" message="No complaint record exists for this ID." /></AdminShell>;
  }
  return (
    <AdminShell>
      <PageHeader title={complaint.id} subtitle="Full complaint intelligence and routing controls." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-primary">Complaint Summary</h2>
            <p className="mb-4">{complaint.text}</p>
            <InfoGrid
              items={[
                ["Citizen", complaint.citizen],
                ["Complaint For", complaint.complaintFor === "known_member" ? "Known member" : "Self"],
                ["Affected Person", complaint.affectedPersonName || "-"],
                ["Affected Contact", complaint.affectedPersonMobile || "-"],
                ["Relationship", complaint.affectedPersonRelationship || "-"],
                ["Language", complaint.language],
                ["Status", complaint.status],
                ["Approved ETA", complaint.eta],
                ["Citizen Proof", complaint.hasCitizenProof ? `${complaint.citizenProofCount} file(s) uploaded` : "No proof uploaded"],
                ["Proof Location", complaint.proofLocationLabel],
                ["Proof Justification", complaint.proofLocationJustification || "-"],
                ["Worker False Evidence", complaint.workerFalseEvidenceCount ? `${complaint.workerFalseEvidenceCount} file(s) awaiting review` : "None"],
                ["Admin Response", complaint.adminResponse || "Waiting for admin response"],
                ["Submitted", complaint.submittedAt],
              ]}
            />
          </Card>
          <Card className="p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-primary">AI Classification Result</h2>
            <InfoGrid
              items={[
                ["Predicted Category", complaint.category],
                ["AI Departments", complaint.aiDepartments.length ? complaint.aiDepartments.join(" + ") : complaint.category],
                ["Valid Government Complaint", complaint.isValidGrievance === false ? "No" : "Yes"],
                ["Validity Confidence", `${Math.round(complaint.validityConfidence * 100)}%`],
                ["Confidence", `${complaint.confidence}%`],
                ["Priority", complaint.priority],
                ["Language", complaint.language],
                ["Translation Source", complaint.translationSource || "-"],
                ["Summary", complaint.summary],
                ["Rejection Reason", complaint.rejectionReason || "-"],
              ]}
            />
          </Card>
          {complaint.attachments.length ? (
            <Card className="p-6">
              <h2 className="mb-4 font-display text-xl font-bold text-primary">Complaint Proof and Validation Evidence</h2>
              <AttachmentList attachments={complaint.attachments} />
            </Card>
          ) : null}
          <Card className="p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-primary">Timeline</h2>
            <div className="space-y-3">
              {complaint.timeline.map((item, index) => (
                <div key={`${item.message || item.event}-${index}`} className="flex items-center gap-3">
                  <Icon name="check_circle" className="text-secondary" />
                  <span className="text-sm">{item.message || item.event}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <aside className="space-y-6">
          {["false_review", "resolution_review"].includes(complaint.rawStatus) ? (
            <Card className="p-5">
              <h2 className="mb-3 font-display text-lg font-bold text-primary">Admin Review Decision</h2>
              <p className="mb-4 text-sm text-text-muted">
                Worker evidence is pending admin approval before the complaint is removed or marked resolved.
              </p>
              {complaint.rawStatus === "false_review" ? (
                <Button variant="danger" type="button" onClick={approveWorkerFalseReport}>
                  Approve False And Delete
                </Button>
              ) : (
                <Button variant="primary" type="button" onClick={approveWorkerResolution}>
                  Approve Resolution
                </Button>
              )}
            </Card>
          ) : null}
          <Card className="p-5">
            <h2 className="mb-4 font-display text-lg font-bold text-primary">Location</h2>
            <LiveMap points={[complaint]} height={260} />
          </Card>
          <Card className="p-5">
            <h2 className="mb-3 font-display text-lg font-bold text-primary">Send Citizen Response</h2>
            <form className="grid gap-3" onSubmit={submitAdminResponse}>
              <Field label="Response message">
                <textarea
                  className={`${inputClass} min-h-28`}
                  value={responseForm.responseMessage}
                  onChange={(event) => setResponseForm((current) => ({ ...current, responseMessage: event.target.value }))}
                  placeholder="Write what action will be taken or whether the complaint has been resolved..."
                />
              </Field>
              <Field label="Approved ETA in hours">
                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  value={responseForm.etaHours}
                  onChange={(event) => setResponseForm((current) => ({ ...current, etaHours: event.target.value }))}
                  placeholder="Example: 24"
                />
              </Field>
              <Field label="Status">
                <select
                  className={inputClass}
                  value={responseForm.status}
                  onChange={(event) => setResponseForm((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="assigned">Assigned</option>
                  <option value="manual_review">Manual Review</option>
                </select>
              </Field>
              <Button type="submit" variant="secondary">
                Send Response
              </Button>
            </form>
          </Card>
          <Card className="p-5">
            <h2 className="mb-3 font-display text-lg font-bold text-primary">Escalation and Validation</h2>
            <p className="mb-4 text-sm text-text-muted">
              Reminder and escalation are handled automatically when SLA is missed. Use the test button during demo to show
              escalation working.
            </p>
            <div className="grid gap-3">
              <Button variant="danger" type="button" onClick={testEscalation}>
                Test Escalation
              </Button>
              <Field label="False complaint verification note">
                <textarea
                  className={`${inputClass} min-h-24`}
                  value={falseNote}
                  onChange={(event) => setFalseNote(event.target.value)}
                  placeholder="Explain how this was verified as false..."
                />
              </Field>
              <Field label="Place evidence photo/video">
                <input
                  className={inputClass}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(event) => setFalseEvidence(Array.from(event.target.files || []))}
                />
              </Field>
              {falseEvidence.length ? (
                <p className="text-sm text-text-muted">{falseEvidence.length} evidence file(s) selected.</p>
              ) : null}
              <Button variant="outline" type="button" onClick={markFalse}>
                Mark False With Evidence
              </Button>
              {actionMessage ? <p className="text-sm text-text-muted">{actionMessage}</p> : null}
            </div>
          </Card>
        </aside>
      </div>
    </AdminShell>
  );
}

export function ManualReviewPage() {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [message, setMessage] = useState("");
  useEffect(() => {
    api.listComplaints().then((data) => {
      const nextRows = sortByPriority((data.results || []).map(mapComplaint).filter((item) => item.confidence < 65 || item.manualReview));
      setRows(nextRows);
      setSelectedId(nextRows[0]?.id || "");
    }).catch(() => setRows([]));
    api.listDepartments().then((data) => {
      const nextDepartments = data.results || [];
      setDepartments(nextDepartments);
      setCategory(nextDepartments[0]?.category_key || "");
    }).catch(() => setDepartments([]));
  }, []);

  async function saveReview() {
    setMessage("");
    if (!selectedId || !category) {
      setMessage("Select a complaint and department.");
      return;
    }
    try {
      await api.submitClassificationFeedback({
        complaint_id: selectedId,
        corrected_category: category,
        corrected_priority: priority,
        comment: "Manual review correction from admin panel.",
      });
      setRows((current) => current.filter((item) => item.id !== selectedId));
      setSelectedId("");
      setMessage("Manual review saved and sent to backend feedback.");
    } catch (error) {
      setMessage(error.message || "Could not save manual review.");
    }
  }

  return (
    <AdminShell>
      <PageHeader title="Manual Review" subtitle="Review low-confidence or sensitive complaints before final routing." />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <ReviewList title="Needs Review" rows={rows} selectedId={selectedId} onSelect={setSelectedId} />
        <Card className="p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">Review Panel</h2>
          <div className="space-y-4">
            <Field label="Correct Department">
              <select className={inputClass} value={category} onChange={(event) => setCategory(event.target.value)}>
                {departments.map((department) => (
                  <option key={department.id} value={department.category_key}>
                    {department.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select className={inputClass} value={priority} onChange={(event) => setPriority(event.target.value)}>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
                <option>Low</option>
              </select>
            </Field>
            <label className="flex gap-2 text-sm text-text-muted">
              <input type="checkbox" defaultChecked />
              Save correction for model feedback
            </label>
            <Button className="w-full" type="button" onClick={saveReview}>Assign Department</Button>
            {message ? <p className="text-sm text-text-muted">{message}</p> : null}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

export function ActiveWorkPage() {
  const [activeWorks, setActiveWorks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [location, setLocation] = useState({
    latitude: 28.6139,
    longitude: 77.209,
    address: "",
    ward: "",
    landmark: "",
  });
  const [form, setForm] = useState({
    category: "electricity",
    work_type: "Electricity maintenance",
    title: "",
    public_message: "",
    radius_km: 1.5,
    expected_end_time: "",
  });
  const [message, setMessage] = useState("");

  function loadActiveWork() {
    api.listActiveWork().then((data) => setActiveWorks((data.results || []).map(mapActiveWork))).catch(() => setActiveWorks([]));
  }

  useEffect(() => {
    loadActiveWork();
    api.listDepartments().then((data) => {
      const nextDepartments = data.results || [];
      setDepartments(nextDepartments);
      setForm((current) => ({ ...current, category: nextDepartments[0]?.category_key || "electricity" }));
    }).catch(() => setDepartments([]));
  }, []);

  async function createWork(event) {
    event.preventDefault();
    setMessage("");
    try {
      await api.createActiveWork({
        ...form,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        ward: location.ward,
        zone: location.ward,
        status: "active",
        start_time: new Date().toISOString(),
      });
      setMessage("Active work saved. Matching complaints in this category and radius will receive this auto-message.");
      loadActiveWork();
    } catch (error) {
      setMessage(error.message || "Could not save active work.");
    }
  }

  const columns = [
    { key: "id", label: "Work ID" },
    { key: "department", label: "Department" },
    { key: "type", label: "Work Type" },
    { key: "area", label: "Affected Area" },
    { key: "end", label: "Expected End" },
    { key: "status", label: "Status", render: (row) => <Badge tone="teal">{row.status}</Badge> },
    { key: "linked", label: "Linked Complaints" },
  ];
  return (
    <AdminShell>
      <PageHeader title="Active Government Work" subtitle="Create prior work records and approved auto-messages for matching complaint locations." />
      <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_430px]">
        {activeWorks.length === 0 ? <EmptyState title="No active work records" message="Create records from the backend/API to enable auto-responses." /> : <Table columns={columns} rows={activeWorks} renderActions={() => <button className="font-semibold text-secondary">Edit</button>} />}
        <Card className="p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">Add Prior Work + Auto-Message</h2>
          <form className="space-y-4" onSubmit={createWork}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Department">
                <select className={inputClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                  {departments.map((department) => (
                    <option key={department.id} value={department.category_key}>{department.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Work Type">
                <input className={inputClass} value={form.work_type} onChange={(event) => setForm({ ...form, work_type: event.target.value })} />
              </Field>
            </div>
            <Field label="Work Title">
              <input className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Electricity maintenance in Ward 4" required />
            </Field>
            <Field label="Approved Auto-Message">
              <textarea className={`${inputClass} min-h-24`} value={form.public_message} onChange={(event) => setForm({ ...form, public_message: event.target.value })} placeholder="Electricity maintenance is ongoing in your area. Supply is expected to resume by 6:00 PM." required />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Affected Radius (km)">
                <input className={inputClass} type="number" min="0.1" step="0.1" value={form.radius_km} onChange={(event) => setForm({ ...form, radius_km: Number(event.target.value) })} />
              </Field>
              <Field label="Expected End Time">
                <input className={inputClass} type="datetime-local" value={form.expected_end_time} onChange={(event) => setForm({ ...form, expected_end_time: event.target.value })} required />
              </Field>
            </div>
            <LocationPicker value={location} onChange={setLocation} />
            <Button className="w-full"><Icon name="add" />Save Active Work</Button>
            {message ? <p className="text-sm text-text-muted">{message}</p> : null}
          </form>
        </Card>
      </div>
      {activeWorks.length ? (
        <Card className="p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">Active Work Map</h2>
          <LiveMap points={activeWorks} center={activeWorks[0]} radiusKm={activeWorks[0]?.radiusKm} height={360} />
        </Card>
      ) : null}
    </AdminShell>
  );
}

export function EscalationsPage() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");

  function loadComplaints() {
    api.listComplaints().then((data) => setComplaints(sortByPriority((data.results || []).map(mapComplaint)))).catch(() => setComplaints([]));
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  async function processOverdue() {
    setMessage("");
    try {
      const data = await api.processOverdueComplaints();
      setMessage(`Processed overdue complaints. Reminded: ${data.reminded}, escalated: ${data.escalated}.`);
      loadComplaints();
    } catch (error) {
      setMessage(error.message || "Could not process overdue complaints.");
    }
  }

  const escalated = complaints.filter((item) => item.rawStatus === "escalated" || item.status === "Escalated");
  return (
    <AdminShell>
      <PageHeader
        title="Escalations"
        subtitle="Monitor complaints that missed SLA deadlines."
        action={<Button variant="danger" onClick={processOverdue}>Run Overdue Check</Button>}
      />
      {message ? <p className="mb-4 rounded-md border border-border bg-white p-3 text-sm text-text-muted">{message}</p> : null}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Overdue" value={complaints.filter((item) => item.status === "Overdue").length} icon="warning" tone="red" />
        <StatCard label="Reminders Sent" value={complaints.reduce((sum, item) => sum + (item.reminderCount || 0), 0)} icon="notifications_active" tone="amber" />
        <StatCard label="Escalated Today" value={escalated.length} icon="priority_high" tone="red" />
        <StatCard label="Critical Unresolved" value={complaints.filter((item) => item.priority === "Critical" && item.rawStatus !== "resolved").length} icon="bolt" tone="red" />
      </div>
      <ComplaintMiniTable title="Escalated Complaints" rows={escalated} />
    </AdminShell>
  );
}

export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    api.listUsers().then((data) => setUsers((data.results || []).map(mapUser))).catch(() => setUsers([]));
  }, []);
  const columns = [
    { key: "id", label: "User ID" },
    { key: "mobile", label: "Mobile" },
    { key: "total", label: "Total Complaints" },
    { key: "falseCount", label: "False Complaints" },
    { key: "warnings", label: "Warnings" },
    { key: "status", label: "Status", render: (row) => <Badge tone={row.status === "Restricted" ? "amber" : "green"}>{row.status}</Badge> },
    { key: "lastComplaint", label: "Last Complaint" },
  ];
  return (
    <AdminShell>
      <PageHeader title="User Management" subtitle="Track misuse and block users only after verified false complaints." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total Users" value={users.length} icon="group" />
        <StatCard label="OTP Verified" value={users.filter((user) => user.verified).length} icon="verified_user" tone="green" />
        <StatCard label="Restricted" value={users.filter((user) => user.status === "Restricted").length} icon="warning" tone="amber" />
        <StatCard label="Blocked" value={users.filter((user) => user.status === "Blocked").length} icon="block" tone="red" />
      </div>
      {users.length === 0 ? <EmptyState title="No users found" message="OTP-verified users will appear here." /> : <Table columns={columns} rows={users} renderActions={() => <button className="font-semibold text-primary">Review</button>} />}
    </AdminShell>
  );
}

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [stateQuery, setStateQuery] = useState("");
  const [mapCenter, setMapCenter] = useState(null);
  const [mapMessage, setMapMessage] = useState("");

  function loadAnalytics(state = "") {
    api.dashboardAnalytics(state ? { state } : {}).then(setAnalytics).catch(() => setAnalytics({}));
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function searchState(event) {
    event.preventDefault();
    const state = stateQuery.trim();
    setMapMessage("");
    loadAnalytics(state);
    if (!state) {
      setMapCenter(null);
      return;
    }
    try {
      const data = await api.geoSearch(`${state}, India`);
      const feature = data.features?.[0];
      if (feature?.properties) {
        setMapCenter({
          latitude: feature.properties.lat,
          longitude: feature.properties.lon,
        });
        setMapMessage(`Showing heatmap around ${feature.properties.formatted || state}.`);
      } else {
        setMapMessage("State not found. Showing available complaint points.");
      }
    } catch (error) {
      setMapMessage(error.message || "Could not search state location.");
    }
  }

  return (
    <AdminShell>
      <PageHeader title="Analytics" subtitle="Complaint trends, department performance, SLA breaches, and AI accuracy." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">Department Volume</h2>
          {Object.entries(analytics?.department_volume || {}).length === 0 ? <p className="text-sm text-text-muted">No category data yet.</p> : Object.entries(analytics?.department_volume || {}).map(([label, value]) => (
            <Bar key={label} label={label} value={value} />
          ))}
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">AI Classification Quality</h2>
          <InfoGrid items={[["Total Classified", analytics?.total_classified ?? 0], ["Manual Review", analytics?.manual_review ?? 0], ["Low Confidence", analytics?.low_confidence ?? 0], ["Accuracy Estimate", `${analytics?.estimated_accuracy ?? 0}%`], ["Average Confidence", `${analytics?.average_confidence ?? 0}%`]]} />
        </Card>
        <Card className="p-6 xl:col-span-2">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="font-display text-xl font-bold text-primary">Location Heatmap</h2>
              <p className="mt-1 text-sm text-text-muted">Search any Indian state to recenter the heatmap and filter available complaint points.</p>
            </div>
            <form className="flex w-full gap-2 md:w-[420px]" onSubmit={searchState}>
              <input
                className={inputClass}
                value={stateQuery}
                onChange={(event) => setStateQuery(event.target.value)}
                placeholder="Example: Maharashtra"
              />
              <Button type="submit" variant="secondary">Search</Button>
            </form>
          </div>
          {mapMessage ? <p className="mb-3 text-sm text-text-muted">{mapMessage}</p> : null}
          <LiveMap points={(analytics?.heatmap_points || []).map(mapHeatPoint)} center={mapCenter} zoom={mapCenter ? 7 : 5} height={420} heatmap />
        </Card>
      </div>
    </AdminShell>
  );
}

export function SettingsPage() {
  const [departments, setDepartments] = useState([]);
  const [health, setHealth] = useState(null);
  useEffect(() => {
    api.listDepartments().then((data) => setDepartments(data.results || [])).catch(() => setDepartments([]));
    api.health().then(setHealth).catch(() => setHealth({}));
  }, []);
  return (
    <AdminShell>
      <PageHeader title="Settings" subtitle="Configure departments, SLA/ETA rules, notification modes, AI thresholds, and Geoapify status." />
      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsCard title="Department Settings" items={departments.map((department) => `${department.name} - default ETA ${department.default_eta_hours}h`)} />
        <Card className="p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">SLA and ETA Rules</h2>
          <div className="space-y-3">
            {["Critical: 2-4 hours", "High: 12-48 hours", "Medium: 2-5 days", "Low: 3-7 days"].map((item) => (
              <div key={item} className="rounded-md border border-border p-3 text-sm">{item}</div>
            ))}
          </div>
        </Card>
        <SettingsCard title="Notification Settings" items={["In-app notifications enabled", "Prototype OTP enabled", "SMS disabled", "WhatsApp disabled", "Email disabled"]} />
        <SettingsCard title="Map and Geocoding" items={["Map display: Leaflet/OpenStreetMap", "Geocoding provider: Geoapify", `Geoapify configured: ${health?.geoapify_configured ? "Yes" : "No"}`]} />
      </div>
    </AdminShell>
  );
}

function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">{title}</h1>
        <p className="mt-1 text-text-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function ComplaintFilters({ filters, onChange }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <Card className="mb-5 p-4">
      <p className="mb-3 text-sm font-semibold text-primary">Filters</p>
      <div className="grid gap-3 md:grid-cols-5">
        <Field label="Search">
          <input className={inputClass} value={filters.search} onChange={(event) => update("search", event.target.value)} placeholder="ID, text, ward" />
        </Field>
        <Field label="Status">
          <select className={inputClass} value={filters.status} onChange={(event) => update("status", event.target.value)}>
            <option value="">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="manual_review">Manual Review</option>
            <option value="auto_responded">Auto Responded</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>
        </Field>
        <Field label="Department">
          <select className={inputClass} value={filters.category} onChange={(event) => update("category", event.target.value)}>
            <option value="">All departments</option>
            <option value="electricity">Electricity</option>
            <option value="water_supply">Water Supply</option>
            <option value="sanitation">Sanitation</option>
            <option value="roads">Roads / Public Works</option>
            <option value="public_services">Public Services</option>
            <option value="health">Health</option>
            <option value="transport">Transport</option>
            <option value="education">Education</option>
          </select>
        </Field>
        <Field label="Priority">
          <select className={inputClass} value={filters.priority} onChange={(event) => update("priority", event.target.value)}>
            <option value="">All priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </Field>
        <Field label="Ward / Zone">
          <input className={inputClass} value={filters.ward} onChange={(event) => update("ward", event.target.value)} placeholder="Ward 12" />
        </Field>
      </div>
    </Card>
  );
}

function ReviewList({ title, rows, selectedId, onSelect }) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 font-display text-xl font-bold text-primary">{title}</h2>
      <div className="space-y-3">
        {rows.length === 0 ? <p className="text-sm text-text-muted">No manual review complaints right now.</p> : null}
        {rows.map((item) => (
          <button
            key={item.id}
            className={`w-full rounded-md border p-3 text-left ${selectedId === item.id ? "border-primary bg-surface-soft" : "border-border bg-white"}`}
            onClick={() => onSelect(item.id)}
            type="button"
          >
            <div className="flex justify-between gap-3">
              <p className="font-mono text-sm font-semibold text-primary">{item.id}</p>
              <Badge tone={priorityTone(item.priority)}>{item.priority}</Badge>
            </div>
            <p className="mt-1 text-sm text-text-muted">{item.category} · confidence {item.confidence}%</p>
          </button>
        ))}
      </div>
    </Card>
  );
}

function ComplaintMiniTable({ title, rows }) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 font-display text-xl font-bold text-primary">{title}</h2>
      <div className="space-y-3">
        {rows.map((item) => (
          <div key={item.id} className="rounded-md border border-border p-3">
            <div className="flex justify-between gap-3">
              <p className="font-mono text-sm font-semibold text-primary">{item.id}</p>
              <Badge tone={priorityTone(item.priority)}>{item.priority}</Badge>
            </div>
            <p className="mt-1 text-sm text-text-muted">{item.category} · {item.location}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActiveWorkMiniTable({ rows }) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 font-display text-xl font-bold text-primary">Active Work Ending Soon</h2>
      <div className="space-y-3">
        {rows.length === 0 ? <p className="text-sm text-text-muted">No active work records yet.</p> : rows.map((item) => (
          <div key={item.id} className="rounded-md border border-border p-3">
            <p className="font-semibold text-primary">{item.type}</p>
            <p className="text-sm text-text-muted">{item.area} · Expected end: {item.end}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function InfoGrid({ items }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p>
          <p className="mt-1 font-semibold text-primary">{value}</p>
        </div>
      ))}
    </div>
  );
}

function Bar({ label, value }) {
  const width = Math.min(Number(value) * 10, 100);
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-semibold text-primary">{label}</span>
        <span className="text-text-muted">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-soft">
        <div className="h-2 rounded-full bg-secondary" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ title, message }) {
  return (
    <Card className="p-8 text-center">
      <Icon name="inbox" className="mx-auto mb-3 text-4xl text-text-muted" />
      <h2 className="font-display text-xl font-bold text-primary">{title}</h2>
      <p className="mt-2 text-sm text-text-muted">{message}</p>
    </Card>
  );
}

function mapComplaint(item) {
  return {
    id: item.tracking_id || item.id,
    rawStatus: item.status,
    text: item.raw_text || "",
    citizen: item.citizen?.mobile_number || "",
    category: item.category_label || item.category || "Manual Review",
    confidence: Math.round((item.confidence_score || 0) * 100),
    priority: item.priority || "Medium",
    complaintFor: item.complaint_for || "self",
    affectedPersonName: item.affected_person_name || "",
    affectedPersonMobile: item.affected_person_mobile || "",
    affectedPersonRelationship: item.affected_person_relationship || "",
    complaintForLabel: item.complaint_for === "known_member" ? "Known member" : "Self",
    affectedContact: item.complaint_for === "known_member" ? (item.affected_person_mobile || item.affected_person_name || "-") : item.citizen?.mobile_number || "-",
    proofLocation: item.citizen_proof_location || {},
    proofLocationLabel: item.citizen_proof_location?.latitude
      ? `${item.citizen_proof_location.matches_complaint_location ? "Matched" : "Mismatch"} (${Math.round(item.citizen_proof_location.distance_meters || 0)} m)`
      : "Not captured",
    proofLocationJustification: item.citizen_proof_location?.justification || "",
    status: humanize(item.status || "submitted"),
    department: item.assigned_department?.name || "-",
    officer: item.assigned_officer?.name || "-",
    location: item.address || item.ward || "-",
    submittedAtRaw: item.created_at || "",
    submittedAt: formatDateTime(item.created_at),
    eta: item.eta_approved && item.estimated_resolution_hours ? `${item.estimated_resolution_hours} hours` : "Waiting for admin response",
    sla: item.sla_deadline ? formatDateTime(item.sla_deadline) : "Waiting for admin response",
    adminResponse: item.admin_response || "",
    etaApproved: item.eta_approved,
    hasCitizenProof: Boolean(item.has_citizen_proof),
    citizenProofCount: item.citizen_proof_count || 0,
    falseValidationEvidenceCount: item.false_validation_evidence_count || 0,
    workerFalseEvidenceCount: item.worker_false_evidence_count || 0,
    resolutionEvidenceCount: item.resolution_evidence_count || 0,
    language: item.language || "-",
    translatedText: item.translated_text || "",
    translationSource: item.translation_source || "",
    isValidGrievance: item.is_valid_grievance,
    validityConfidence: item.validity_confidence || 0,
    aiDepartments: item.ai_departments || [],
    rejectionReason: item.ai_rejection_reason || "",
    primaryDepartmentLabel: item.primary_department_label || "",
    secondaryDepartmentLabels: item.secondary_department_labels || [],
    summary: item.summary || "",
    timeline: item.timeline || [],
    attachments: item.attachments || [],
    reminderCount: item.reminder_count || 0,
    manualReview: item.manual_review_required,
    latitude: item.latitude,
    longitude: item.longitude,
    address: item.address,
    ward: item.ward,
  };
}

function AttachmentList({ attachments }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {attachments.map((item, index) => (
        <a
          key={`${item.url || item.name}-${index}`}
          className="rounded-md border border-border bg-surface-soft p-3 text-sm font-semibold text-primary hover:border-secondary"
          href={resolveMediaUrl(item.url)}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name={String(item.content_type || "").startsWith("video") ? "videocam" : "image"} />
          <span className="ml-2">{item.name || `Evidence ${index + 1}`}</span>
          <p className="mt-1 text-xs font-normal text-text-muted">{item.purpose || "proof"}</p>
        </a>
      ))}
    </div>
  );
}

function mapActiveWork(item) {
  return {
    id: item.work_id || item.id,
    department: item.department?.name || item.category || "-",
    type: item.work_type || "-",
    area: item.address || item.ward || item.zone || "-",
    end: item.expected_end_time || "-",
    status: humanize(item.status || "active"),
    linked: item.linked_complaint_count || 0,
    message: item.public_message || "",
    latitude: item.latitude,
    longitude: item.longitude,
    radiusKm: item.radius_km,
    address: item.address,
    ward: item.ward,
    title: item.title,
  };
}

function mapHeatPoint(item) {
  const priority = item.priority || "Medium";
  const heatConfig = {
    Critical: { heatRadius: 3400, heatOpacity: 0.42, heatColor: "#dc2626" },
    High: { heatRadius: 2800, heatOpacity: 0.36, heatColor: "#f97316" },
    Medium: { heatRadius: 2200, heatOpacity: 0.3, heatColor: "#f59e0b" },
    Low: { heatRadius: 1600, heatOpacity: 0.24, heatColor: "#22c55e" },
  };
  return {
    id: item.id,
    latitude: item.latitude,
    longitude: item.longitude,
    category: item.category,
    priority,
    status: item.status,
    address: item.address,
    ward: item.ward,
    ...(heatConfig[priority] || heatConfig.Medium),
  };
}

function mapUser(item) {
  return {
    id: item.id,
    mobile: item.mobile_number,
    total: item.total_complaints || 0,
    falseCount: item.false_complaint_count || 0,
    warnings: item.warnings || 0,
    verified: item.is_verified,
    status: item.is_blocked ? "Blocked" : item.is_restricted ? "Restricted" : item.is_verified ? "OTP Verified" : "Unverified",
    lastComplaint: item.updated_at || "-",
  };
}

function buildChartValues(source = {}) {
  const values = Object.values(source);
  if (values.length === 0) return [0, 0, 0, 0, 0, 0];
  return values.map((value) => Math.max(12, Math.min(Number(value) * 18, 160)));
}

function humanize(value) {
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function SettingsCard({ title, items }) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 font-display text-xl font-bold text-primary">{title}</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 rounded-md border border-border p-3 text-sm">
            <Icon name="check_circle" className="text-secondary" />
            {item}
          </div>
        ))}
      </div>
    </Card>
  );
}


