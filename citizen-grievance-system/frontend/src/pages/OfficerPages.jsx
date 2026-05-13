import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge, Button, Card, EmptyMap, Field, SidebarLayout, StatCard, Table, inputClass } from "../components/ui";
import { api } from "../lib/api";
import { priorityTone, statusTone } from "../lib/format";

const officerNav = [
  { to: "/officer", label: "My Dashboard", icon: "dashboard" },
  { to: "/officer/assigned", label: "Assigned Complaints", icon: "assignment" },
  { to: "/officer/high-priority", label: "High Priority", icon: "priority_high" },
  { to: "/officer/overdue", label: "Overdue", icon: "warning" },
  { to: "/officer/resolved", label: "Resolved", icon: "check_circle" },
];

function OfficerShell({ children }) {
  return (
    <SidebarLayout title="Officer Portal" subtitle="Department Workflow" navItems={officerNav}>
      {children}
    </SidebarLayout>
  );
}

export function OfficerDashboardPage() {
  const [complaints, setComplaints] = useState([]);
  useEffect(() => {
    api.listComplaints().then((data) => setComplaints((data.results || []).map(mapComplaint))).catch(() => setComplaints([]));
  }, []);

  const columns = [
    { key: "id", label: "Complaint ID" },
    { key: "category", label: "Category" },
    { key: "priority", label: "Priority", render: (row) => <Badge tone={priorityTone(row.priority)}>{row.priority}</Badge> },
    { key: "location", label: "Location" },
    { key: "sla", label: "SLA Deadline" },
    { key: "status", label: "Status", render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
  ];

  return (
    <OfficerShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-primary">Officer Dashboard</h1>
        <p className="mt-1 text-text-muted">Assigned complaints, SLA countdowns, and progress updates.</p>
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <StatCard label="Assigned to Me" value="18" icon="assignment" />
        <StatCard label="In Progress" value="9" icon="construction" tone="secondary" />
        <StatCard label="Due Today" value="5" icon="today" tone="amber" />
        <StatCard label="Overdue" value="2" icon="warning" tone="red" />
        <StatCard label="Resolved This Week" value="21" icon="check_circle" tone="green" />
      </div>
      {complaints.length === 0 ? <EmptyState title="No assigned complaints" message="Officer assignments from MongoDB will appear here." /> : <Table
        columns={columns}
        rows={complaints}
        renderActions={(row) => (
          <a className="font-semibold text-secondary hover:underline" href={`/officer/complaints/${row.id}`}>
            Open
          </a>
        )}
      />}
    </OfficerShell>
  );
}

export function OfficerComplaintDetailPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  useEffect(() => {
    api.getComplaint(id).then((data) => setComplaint(mapComplaint(data.complaint))).catch(() => setComplaint(null));
  }, [id]);
  if (!complaint) {
    return <OfficerShell><EmptyState title="Complaint not found" message="No complaint assignment exists for this ID." /></OfficerShell>;
  }
  return (
    <OfficerShell>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">{complaint.id}</h1>
          <p className="text-text-muted">{complaint.department} · {complaint.location}</p>
        </div>
        <Badge tone={priorityTone(complaint.priority)}>{complaint.priority}</Badge>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-primary">Complaint Summary</h2>
            <p className="mb-4 text-text-main">{complaint.text}</p>
            <div className="grid gap-4 md:grid-cols-3">
              <Info label="Category" value={complaint.category} />
              <Info label="AI Confidence" value={`${complaint.confidence}%`} />
              <Info label="Sentiment" value={complaint.sentiment} />
              <Info label="SLA Deadline" value={complaint.sla} />
              <Info label="Estimated Time" value={complaint.eta} />
              <Info label="Current Status" value={complaint.status} />
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-primary">Status Update</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="New Status">
                <select className={inputClass}>
                  <option>Assigned</option>
                  <option>In Progress</option>
                  <option>Work Scheduled</option>
                  <option>Resolved</option>
                  <option>Cannot Resolve / Needs Escalation</option>
                </select>
              </Field>
              <Field label="Optional Proof Upload">
                <input className={inputClass} type="file" />
              </Field>
              <Field label="Progress Note">
                <textarea className={`${inputClass} min-h-28 md:col-span-2`} placeholder="Add field update or resolution note..." />
              </Field>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button>Submit Status Update</Button>
              <Button variant="outline">Request Escalation</Button>
              <Button variant="danger">Mark False With Verification Note</Button>
            </div>
          </Card>
        </div>
        <aside className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-4 font-display text-lg font-bold text-primary">Location</h2>
            <EmptyMap label={complaint.location} />
          </Card>
          <Card className="p-5">
            <h2 className="mb-3 font-display text-lg font-bold text-primary">SLA Countdown</h2>
            <div className="rounded-md bg-amber-50 p-4 text-amber-800">
              <p className="text-3xl font-bold">03:42</p>
              <p className="text-sm">remaining before reminder threshold</p>
            </div>
          </Card>
        </aside>
      </div>
    </OfficerShell>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 font-semibold text-primary">{value}</p>
    </div>
  );
}

function EmptyState({ title, message }) {
  return (
    <Card className="p-8 text-center">
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
    category: item.category_label || item.category || "Manual Review",
    confidence: Math.round((item.confidence_score || 0) * 100),
    priority: item.priority || "Medium",
    status: humanize(item.status || "submitted"),
    department: item.assigned_department?.name || "-",
    location: item.address || item.ward || "-",
    sla: item.sla_deadline || "-",
    eta: item.estimated_resolution_hours ? `${item.estimated_resolution_hours} hours` : "-",
    sentiment: item.sentiment || "-",
  };
}

function humanize(value) {
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
