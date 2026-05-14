import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import LocationPicker from "../components/LocationPicker";
import { Badge, Button, Card, EmptyMap, Field, Icon, StatCard, Table, inputClass } from "../components/ui";
import { api, clearSession, getCurrentUser, resolveMediaUrl } from "../lib/api";
import { formatDateTime, priorityTone, sortByPriority, statusTone } from "../lib/format";
import { TTS_LANGUAGE_OPTIONS, buildComplaintSpeech, getPreferredTtsLanguage, setPreferredTtsLanguage, speakComplaint, speakNotification, stopSpeaking } from "../lib/tts";

const citizenNav = [
  { to: "/my-grievances", label: "Grievances", icon: "list_alt" },
  { to: "/submit", label: "Submit", icon: "add_circle" },
  { to: "/notifications", label: "Alerts", icon: "notifications" },
];

function CitizenShell({ children }) {
  const navigate = useNavigate();
  const user = getCurrentUser("citizen");
  const [ttsLanguage, setTtsLanguage] = useState(getPreferredTtsLanguage());

  function changeTtsLanguage(event) {
    const lang = event.target.value;
    setTtsLanguage(lang);
    setPreferredTtsLanguage(lang);
    stopSpeaking();
  }

  function logout() {
    clearSession("citizen");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="sticky top-0 z-20 border-b border-border bg-white px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/my-grievances" className="max-w-[170px] truncate font-display text-base font-bold text-primary sm:max-w-none sm:text-lg">
            Smart Grievance Routing System
          </Link>
          <nav className="hidden items-center gap-2 text-sm font-semibold text-text-muted md:flex">
            {citizenNav.map((item) => (
              <Link key={item.to} className="rounded-md px-3 py-2 hover:bg-surface-soft" to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-text-muted">
            <label className="flex items-center gap-2 font-semibold text-primary">
              <Icon name="record_voice_over" className="text-secondary" />
              <span className="sr-only">Text to speech language</span>
              <select className="rounded-md border border-border bg-white px-2 py-1 text-sm text-primary" value={ttsLanguage} onChange={changeTtsLanguage} title="Text to speech language">
                {TTS_LANGUAGE_OPTIONS.map((item) => (
                  <option key={item.lang} value={item.lang}>{item.label}</option>
                ))}
              </select>
            </label>
            <div className="hidden items-center gap-2 sm:flex">
              <Icon name="verified_user" className="text-secondary" />
              +91 {user?.mobile_number || "Verified User"}
            </div>
            <button className="font-semibold text-primary hover:underline" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4 pb-24 lg:p-8">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-3 border-t border-border bg-white px-2 py-2 shadow-[0_-8px_24px_rgba(15,42,68,0.08)] md:hidden">
        {citizenNav.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 text-[11px] font-semibold ${
                isActive ? "bg-secondary/10 text-secondary" : "text-text-muted"
              }`
            }
            to={item.to}
          >
            <Icon name={item.icon} className="text-[22px]" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function MyGrievancesPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listComplaints()
      .then((data) => setComplaints(sortByPriority((data.results || []).map(mapComplaint))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "id", label: "Complaint ID" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status", render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    { key: "priority", label: "Priority", render: (row) => <Badge tone={priorityTone(row.priority)}>{row.priority}</Badge> },
    { key: "eta", label: "ETA" },
    { key: "department", label: "Department" },
  ];

  return (
    <CitizenShell>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">My Grievances</h1>
          <p className="mt-1 text-text-muted">Submit complaints and track response timelines.</p>
        </div>
        <Button as={Link} onClick={() => {}} className="w-fit">
          <Link to="/submit" className="flex items-center gap-2">
            <Icon name="add" /> Submit New Complaint
          </Link>
        </Button>
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <StatCard label="Total" value={complaints.length} icon="list_alt" />
        <StatCard label="Pending" value={complaints.filter((item) => ["submitted", "assigned"].includes(item.rawStatus)).length} icon="schedule" tone="secondary" />
        <StatCard label="In Progress" value={complaints.filter((item) => item.rawStatus === "in_progress").length} icon="construction" tone="secondary" />
        <StatCard label="Resolved" value={complaints.filter((item) => item.rawStatus === "resolved").length} icon="check_circle" tone="green" />
        <StatCard label="Escalated" value={complaints.filter((item) => item.rawStatus === "escalated").length} icon="priority_high" tone="red" />
      </div>
      {loading ? <EmptyState title="Loading complaints" message="Fetching your complaint records from MongoDB." /> : null}
      {error ? <EmptyState title="Could not load complaints" message={error} /> : null}
      {!loading && !error && complaints.length === 0 ? (
        <EmptyState title="No complaints yet" message="Submit your first complaint to see it here." action={<Link to="/submit"><Button>Submit Complaint</Button></Link>} />
      ) : null}
      {!loading && !error && complaints.length > 0 ? (
        <Table
          columns={columns}
          rows={complaints}
          renderActions={(row) => (
            <Link className="font-semibold text-secondary hover:underline" to={`/track/${row.id}`}>
              View Details
            </Link>
          )}
        />
      ) : null}
    </CitizenShell>
  );
}

export function SubmitComplaintPage() {
  const navigate = useNavigate();
  const user = getCurrentUser("citizen");
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [complaintFor, setComplaintFor] = useState("self");
  const [affectedPerson, setAffectedPerson] = useState({
    name: "",
    mobile: "",
    relationship: "",
  });
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [location, setLocation] = useState({
    latitude: 28.6139,
    longitude: 77.209,
    address: "",
    ward: "",
    landmark: "",
  });

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    try {
      const data = await api.createComplaint({
        text,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        ward: location.ward,
        landmark: location.landmark,
        location,
        complaint_for: complaintFor,
        affected_person_name: complaintFor === "known_member" ? affectedPerson.name : "",
        affected_person_mobile: complaintFor === "known_member" ? affectedPerson.mobile : "",
        affected_person_relationship: complaintFor === "known_member" ? affectedPerson.relationship : "",
        attachments,
      });
      navigate("/submitted", { state: { complaint: data.complaint } });
    } catch (error) {
      setMessage(error.message || "Could not submit complaint. Make sure backend and MongoDB are running.");
    }
  }

  async function startRecording() {
    setVoiceMessage("");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setVoiceMessage("Voice recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (!blob.size) {
          setVoiceMessage("No voice was recorded.");
          return;
        }
        setIsTranscribing(true);
        setVoiceMessage("Converting voice to text...");
        try {
          const data = await api.transcribeVoice(blob);
          if (data.text) {
            setText((current) => (current ? `${current.trim()}\n${data.text}` : data.text));
            setVoiceMessage(`Voice added${data.detected_language ? ` (${data.detected_language})` : ""}.`);
          } else {
            setVoiceMessage("No speech detected in the recording.");
          }
        } catch (error) {
          setVoiceMessage(error.message || "Could not transcribe voice.");
        } finally {
          setIsTranscribing(false);
        }
      };
      recorder.start();
      setIsRecording(true);
      setVoiceMessage("Recording...");
    } catch {
      setVoiceMessage("Microphone permission was denied.");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      setIsRecording(false);
    }
  }

  return (
    <CitizenShell>
      <h1 className="mb-6 font-display text-3xl font-bold text-primary">Submit New Complaint</h1>
      <form className="space-y-6" onSubmit={submit}>
        <Card className="p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">Complaint Details</h2>
          <div className="space-y-4">
            <Field label="Describe your complaint">
              <textarea
                className={`${inputClass} min-h-36`}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Example: Bijli ka taar spark kar raha hai, please send someone urgently..."
                required
              />
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant={isRecording ? "secondary" : "outline"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
              >
                <Icon name={isRecording ? "stop" : "mic"} />
                {isRecording ? "Stop Recording" : "Record Voice"}
              </Button>
              {isTranscribing ? (
                <span className="flex items-center gap-2 text-sm font-medium text-secondary">
                  <Icon name="graphic_eq" /> Transcribing
                </span>
              ) : null}
              {voiceMessage ? <span className="text-sm text-text-muted">{voiceMessage}</span> : null}
            </div>
            <Field label="Verified Contact">
              <input className={inputClass} value={`+91 ${user?.mobile_number || ""}`} readOnly />
            </Field>
            <Field label="Who is this complaint for?">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className={`rounded-md border px-4 py-3 text-left font-semibold transition ${
                    complaintFor === "self" ? "border-secondary bg-secondary/10 text-primary" : "border-border bg-white text-text-muted hover:border-secondary"
                  }`}
                  onClick={() => setComplaintFor("self")}
                >
                  <Icon name="person" className="mr-2 text-secondary" />
                  For myself
                </button>
                <button
                  type="button"
                  className={`rounded-md border px-4 py-3 text-left font-semibold transition ${
                    complaintFor === "known_member" ? "border-secondary bg-secondary/10 text-primary" : "border-border bg-white text-text-muted hover:border-secondary"
                  }`}
                  onClick={() => setComplaintFor("known_member")}
                >
                  <Icon name="group" className="mr-2 text-secondary" />
                  For a known member
                </button>
              </div>
            </Field>
            {complaintFor === "known_member" ? (
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Member name">
                  <input
                    className={inputClass}
                    value={affectedPerson.name}
                    onChange={(event) => setAffectedPerson((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Name of affected person"
                    required
                  />
                </Field>
                <Field label="Member contact number">
                  <input
                    className={inputClass}
                    value={affectedPerson.mobile}
                    onChange={(event) => setAffectedPerson((current) => ({ ...current, mobile: event.target.value }))}
                    placeholder="Mobile number"
                    required
                  />
                </Field>
                <Field label="Relationship">
                  <input
                    className={inputClass}
                    value={affectedPerson.relationship}
                    onChange={(event) => setAffectedPerson((current) => ({ ...current, relationship: event.target.value }))}
                    placeholder="Friend, neighbour, family..."
                  />
                </Field>
              </div>
            ) : null}
            <Field label="Photo or video proof (optional)">
              <input
                className={inputClass}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(event) => setAttachments(Array.from(event.target.files || []))}
              />
            </Field>
            {attachments.length ? (
              <p className="text-sm text-text-muted">{attachments.length} proof file(s) selected.</p>
            ) : null}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">
            {complaintFor === "known_member" ? "Affected Member Location" : "Complaint Location"}
          </h2>
          <LocationPicker value={location} onChange={setLocation} />
        </Card>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Button className="px-8 py-3" disabled={!text || !location.latitude || !location.longitude || (complaintFor === "known_member" && (!affectedPerson.name || !affectedPerson.mobile))}>
            Submit Complaint
          </Button>
          {message ? <p className="text-sm text-danger">{message}</p> : null}
        </div>
      </form>
    </CitizenShell>
  );
}

export function SubmissionConfirmedPage() {
  const location = useLocation();
  const complaint = location.state?.complaint;
  const speechText = buildComplaintSpeech(complaint);

  useEffect(() => {
    if (speechText) {
      speakComplaint(complaint);
    }
    return stopSpeaking;
  }, [complaint, speechText]);

  return (
    <CitizenShell>
      <Card className="mx-auto max-w-3xl p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-success">
          <Icon name="check_circle" className="text-[34px]" />
        </div>
        <h1 className="font-display text-3xl font-bold text-primary">Complaint Submitted</h1>
        <p className="mt-2 text-text-muted">Your grievance has been registered and routed for action.</p>
        {speechText ? (
          <div className="mt-5 flex justify-center gap-3">
            <Button type="button" variant="secondary" onClick={() => speakComplaint(complaint)}>
              <Icon name="volume_up" /> Listen
            </Button>
            <Button type="button" variant="outline" onClick={stopSpeaking}>
              <Icon name="volume_off" /> Stop
            </Button>
          </div>
        ) : null}
        <div className="mt-6 grid gap-4 text-left md:grid-cols-2">
          <div className="rounded-md bg-surface-soft p-4">
            <p className="text-xs font-bold uppercase text-text-muted">Complaint ID</p>
            <p className="font-mono font-bold text-primary">{complaint?.tracking_id || "No complaint submitted"}</p>
          </div>
          <div className="rounded-md bg-surface-soft p-4">
            <p className="text-xs font-bold uppercase text-text-muted">Estimated Resolution</p>
            <p className="font-bold text-primary">
              {complaint?.eta_approved && complaint?.estimated_resolution_hours
                ? `${complaint.estimated_resolution_hours} hours`
                : "Waiting for admin response"}
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-left">
          <p className="font-semibold text-primary">If active work is found nearby</p>
          <p className="mt-1 text-sm text-text-muted">
            The citizen receives the pre-written government message and the complaint is linked to that work record.
          </p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link to={complaint?.tracking_id ? `/track/${complaint.tracking_id}` : "/my-grievances"}>
            <Button>Track Complaint</Button>
          </Link>
          <Link to="/submit">
            <Button variant="outline">Submit Another</Button>
          </Link>
        </div>
      </Card>
    </CitizenShell>
  );
}

export function ComplaintTrackingPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    api
      .getComplaint(id)
      .then((data) => setComplaint(mapComplaint(data.complaint)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <CitizenShell><EmptyState title="Loading complaint" message="Fetching complaint details." /></CitizenShell>;
  }
  if (error || !complaint) {
    return <CitizenShell><EmptyState title="Complaint not found" message={error || "No complaint found for this ID."} /></CitizenShell>;
  }
  async function submitFeedback(isResolved) {
    setFeedbackMessage("");
    try {
      const data = await api.submitComplaintFeedback(id, {
        type: isResolved ? "resolution_confirmed" : "resolution_rejected",
        comment: isResolved
          ? "Citizen confirmed the complaint is resolved."
          : "Citizen reported the complaint is not resolved yet.",
      });
      setComplaint(mapComplaint(data.complaint));
      setFeedbackMessage(isResolved ? "Thanks, your resolution confirmation was recorded." : "Thanks, your feedback was sent to the department.");
    } catch (err) {
      setFeedbackMessage(err.message || "Could not submit feedback.");
    }
  }

  return (
    <CitizenShell>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">{complaint.id}</h1>
          <p className="text-text-muted">{complaint.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={() => speakComplaint(complaint)}>
            <Icon name="volume_up" /> Listen Status
          </Button>
          <Badge tone={statusTone(complaint.status)}>{complaint.status}</Badge>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-primary">Complaint Summary</h2>
            <p className="mb-5 text-text-main">{complaint.text}</p>
            <div className="grid gap-4 md:grid-cols-3">
              <Info label="Category" value={complaint.category} />
              <Info label="Priority" value={complaint.priority} />
              <Info label="Department" value={complaint.department} />
              <Info label="Submitted" value={complaint.submittedAt} />
              <Info label="ETA" value={complaint.eta} />
              <Info label="SLA Deadline" value={complaint.sla} />
              <Info label="Admin Response" value={complaint.adminResponse || "Waiting for admin response"} />
              {complaint.rawStatus === "rejected" ? <Info label="AI Decision" value={complaint.rejectionReason || "Not a valid government grievance"} /> : null}
            </div>
          </Card>
          {complaint.attachments.length ? (
            <Card className="p-6">
              <h2 className="mb-4 font-display text-xl font-bold text-primary">Uploaded Proof</h2>
              <AttachmentList attachments={complaint.attachments} />
            </Card>
          ) : null}
          <Card className="p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-primary">Status Timeline</h2>
            <div className="space-y-4">
              {complaint.timeline.map((item, index) => (
                <div key={`${item.message}-${index}`} className="flex gap-3">
                  <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-white">
                    <Icon name={index === complaint.timeline.length - 1 ? "radio_button_checked" : "check"} className="text-[16px]" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">{item.message || item.event}</p>
                    <p className="text-sm text-text-muted">System update recorded for accountability.</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <aside className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-4 font-display text-lg font-bold text-primary">Location</h2>
            <EmptyMap label={complaint.location} />
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 font-display text-lg font-bold text-primary">Feedback</h2>
            <p className="mb-4 text-sm text-text-muted">Was your issue resolved?</p>
            <div className="flex gap-3">
              <Button variant="secondary" type="button" onClick={() => submitFeedback(true)}>Yes</Button>
              <Button variant="outline" type="button" onClick={() => submitFeedback(false)}>No</Button>
            </div>
            {feedbackMessage ? <p className="mt-3 text-sm text-text-muted">{feedbackMessage}</p> : null}
          </Card>
        </aside>
      </div>
    </CitizenShell>
  );
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listNotifications()
      .then((data) => setNotifications(data.results || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  const latestNotification = notifications[0];

  return (
    <CitizenShell>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h1 className="font-display text-3xl font-bold text-primary">Notifications</h1>
        {latestNotification ? (
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => speakNotification(latestNotification)}>
              <Icon name="volume_up" /> Listen Latest
            </Button>
            <Button type="button" variant="outline" onClick={stopSpeaking}>
              <Icon name="volume_off" /> Stop
            </Button>
          </div>
        ) : null}
      </div>
      {loading ? <EmptyState title="Loading notifications" message="Fetching system messages." /> : null}
      {error ? <EmptyState title="Could not load notifications" message={error} /> : null}
      {!loading && !error && notifications.length === 0 ? <EmptyState title="No notifications" message="System messages will appear here." /> : null}
      <div className="space-y-3">
        {notifications.map((item) => (
          <Card key={item.id || item.title} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-primary">{item.title}</p>
                <p className="mt-1 text-sm text-text-muted">{item.message}</p>
                <p className="mt-2 text-xs text-text-muted">{item.created_at || item.time}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge tone={item.status === "Unread" ? "blue" : "default"}>{item.status}</Badge>
                <button
                  className="flex items-center gap-1 text-sm font-semibold text-secondary hover:underline"
                  type="button"
                  onClick={() => speakNotification(item)}
                >
                  <Icon name="volume_up" className="text-[18px]" /> Listen
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </CitizenShell>
  );
}

function EmptyState({ title, message, action }) {
  return (
    <Card className="p-8 text-center">
      <Icon name="inbox" className="mx-auto mb-3 text-4xl text-text-muted" />
      <h2 className="font-display text-xl font-bold text-primary">{title}</h2>
      <p className="mt-2 text-sm text-text-muted">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
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
    language: item.language || "-",
    rejectionReason: item.ai_rejection_reason || "",
    aiDepartments: item.ai_departments || [],
    sentiment: item.sentiment || "-",
    summary: item.summary || "",
    timeline: item.timeline || [],
    attachments: item.attachments || [],
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

function humanize(value) {
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 font-semibold text-primary">{value}</p>
    </div>
  );
}
