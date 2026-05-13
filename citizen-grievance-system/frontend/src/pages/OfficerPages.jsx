import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import LiveMap from "../components/LiveMap";
import { Badge, Button, Card, Field, Icon, SidebarLayout, StatCard, Table, inputClass } from "../components/ui";
import { api, resolveMediaUrl } from "../lib/api";
import { formatDateTime, priorityTone, sortByPriority, statusTone } from "../lib/format";

const officerNav = [
  { to: "/officer", label: "Worker Alerts", icon: "notifications_active" },
  { to: "/officer/assigned", label: "Assigned", icon: "assignment" },
  { to: "/officer/high-priority", label: "High Priority", icon: "priority_high" },
  { to: "/officer/overdue", label: "Overdue", icon: "warning" },
  { to: "/officer/resolved", label: "Resolved", icon: "check_circle" },
];

function OfficerShell({ children }) {
  return <SidebarLayout title="Worker Portal" subtitle="Field Verification" navItems={officerNav}>{children}</SidebarLayout>;
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location permission is not available in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => reject(new Error("Allow location permission to continue.")),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

function formatRouteDuration(seconds) {
  if (!seconds && seconds !== 0) return "-";
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

function formatRouteDistance(meters) {
  if (!meters && meters !== 0) return "-";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function OfficerDashboardPage() {
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [worker, setWorker] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(4);
  const [message, setMessage] = useState("");

  const view = useMemo(() => {
    if (location.pathname.includes("high-priority")) return "high-priority";
    if (location.pathname.includes("overdue")) return "overdue";
    if (location.pathname.includes("resolved")) return "resolved";
    if (location.pathname.includes("assigned")) return "assigned";
    return "";
  }, [location.pathname]);

  function loadDashboard() {
    api.listWorkerComplaints(view).then((data) => {
      setWorker(data.worker || null);
      setRadiusKm(data.radius_km || 4);
      setComplaints(sortByPriority((data.results || []).map(mapComplaint)));
    }).catch((error) => {
      setComplaints([]);
      setMessage(error.message || "Could not load worker complaints.");
    });
    api.listNotifications().then((data) => setNotifications(data.results || [])).catch(() => setNotifications([]));
  }

  useEffect(() => {
    loadDashboard();
  }, [view]);

  useEffect(() => {
    getCurrentPosition().then((coords) => {
      setWorkerLocation(coords);
      api.updateWorkerLocation(coords).then(loadDashboard).catch(() => {});
    }).catch(() => setMessage("Allow location permission to see matching field work within 4 km."));
  }, []);

  const activeComplaints = complaints.filter((item) => !["resolved", "closed", "false_review", "resolution_review"].includes(item.rawStatus));
  const incoming = activeComplaints[0];
  const alertNotification = notifications.find((item) => item.status === "worker_alert");

  const columns = [
    { key: "category", label: "Department" },
    { key: "priority", label: "Priority", render: (row) => <Badge tone={priorityTone(row.priority)}>{row.priority}</Badge> },
    { key: "status", label: "Status", render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    { key: "location", label: "Location" },
    { key: "distance", label: "Distance", render: (row) => formatDistance(row, workerLocation) },
    { key: "sla", label: "SLA Deadline" },
  ];

  return (
    <OfficerShell>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Worker Dashboard</h1>
          <p className="mt-1 text-text-muted">Live department jobs within {radiusKm} km, field verification, and photo-backed resolution.</p>
        </div>
        <Button type="button" variant="outline" onClick={loadDashboard}><Icon name="refresh" /> Refresh</Button>
      </div>

      {incoming ? (
        <Card className="mb-6 overflow-hidden border-2 border-secondary">
          <div className="flex flex-col gap-4 bg-primary p-5 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/75"><Icon name="notifications_active" /> Incoming Complaint Alert</p>
              <h2 className="mt-2 font-display text-2xl font-bold">{incoming.category}</h2>
              <p className="mt-1 text-white/80">{alertNotification?.message || incoming.summary || incoming.text}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge tone={priorityTone(incoming.priority)}>{incoming.priority}</Badge>
              <Link to={`/officer/complaints/${incoming.id}`} className="inline-flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary-dark">
                Open Job <Icon name="arrow_forward" />
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <StatCard label="Assigned" value={complaints.filter((item) => item.rawStatus === "assigned").length} icon="assignment" />
        <StatCard label="In Progress" value={complaints.filter((item) => item.rawStatus === "in_progress").length} icon="construction" tone="secondary" />
        <StatCard label="High/Critical" value={activeComplaints.filter((item) => ["High", "Critical"].includes(item.priority)).length} icon="priority_high" tone="amber" />
        <StatCard label="False Review" value={complaints.filter((item) => item.rawStatus === "false_review").length} icon="fact_check" tone="red" />
        <StatCard label="Resolved" value={complaints.filter((item) => item.rawStatus === "resolved").length} icon="check_circle" tone="green" />
      </div>

      {worker ? <Card className="mb-6 p-4"><div className="grid gap-3 md:grid-cols-4"><Info label="Worker" value={worker.name || worker.mobile_number} /><Info label="Department" value={worker.department?.name || "-"} /><Info label="Assigned Zone" value={(worker.zones || []).join(", ") || "-"} /><Info label="Live Location" value={workerLocation ? "Shared" : "Waiting for permission"} /></div></Card> : null}
      {message ? <p className="mb-4 text-sm text-text-muted">{message}</p> : null}
      {complaints.length === 0 ? <EmptyState title="No worker jobs" message={`Valid complaints from your department within ${radiusKm} km will appear as alerts here.`} /> : <Table columns={columns} rows={complaints} renderActions={(row) => <Link className="font-semibold text-secondary hover:underline" to={`/officer/complaints/${row.id}`}>Open</Link>} />}
    </OfficerShell>
  );
}

export function OfficerComplaintDetailPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedAction, setSelectedAction] = useState("resolve");
  const [actionNote, setActionNote] = useState("");
  const [actionEvidence, setActionEvidence] = useState(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionSubmitted, setActionSubmitted] = useState(false);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [hasReachedLocation, setHasReachedLocation] = useState(false);

  function loadComplaint() {
    return api.getComplaint(id).then((data) => setComplaint(mapComplaint(data.complaint))).catch(() => setComplaint(null));
  }

  useEffect(() => {
    loadComplaint();
    setRoute(null);
    setHasReachedLocation(false);
    setActionSubmitted(false);
  }, [id]);

  useEffect(() => {
    getCurrentPosition().then((coords) => {
      setWorkerLocation(coords);
      api.updateWorkerLocation(coords).catch(() => {});
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (complaint?.rawStatus === "in_progress") setHasReachedLocation(true);
  }, [complaint?.rawStatus]);

  async function enableRoute() {
    setMessage("");
    if (!complaint?.latitude || !complaint?.longitude) {
      setMessage("Complaint location coordinates are missing, so route cannot be generated.");
      return;
    }
    setRouteLoading(true);
    try {
      const coords = workerLocation || await getCurrentPosition();
      setWorkerLocation(coords);
      const data = await api.geoRoute({ fromLat: coords.latitude, fromLon: coords.longitude, toLat: complaint.latitude, toLon: complaint.longitude });
      setRoute(data);
      setHasReachedLocation(false);
      setMessage(`Bike route ready: ${formatRouteDistance(data.distance_meters)} around ${formatRouteDuration(data.duration_seconds)}.`);
    } catch (error) {
      setMessage(error.message || "Could not generate route.");
    } finally {
      setRouteLoading(false);
    }
  }

  async function markReachedLocation() {
    setMessage("");
    try {
      const coords = await getCurrentPosition();
      setWorkerLocation(coords);
      api.updateWorkerLocation(coords).catch(() => {});
      setHasReachedLocation(true);
      setMessage("Location reached. Start Work is now enabled.");
    } catch (error) {
      setMessage(error.message || "Could not confirm current location.");
    }
  }

  async function startJob() {
    if (complaint?.rawStatus === "assigned" && !hasReachedLocation) {
      setMessage("Generate the route and mark that you reached the complaint location before starting work.");
      return;
    }
    setMessage("");
    try {
      const data = await api.startWorkerComplaint(id);
      setComplaint(mapComplaint(data.complaint));
      setMessage("Complaint accepted. Status moved to in progress.");
    } catch (error) {
      setMessage(error.message || "Could not accept complaint.");
    }
  }

  async function submitWorkerAction(event) {
    event.preventDefault();
    setMessage("");
    setActionSubmitted(false);
    if (selectedAction === "resolve" && !actionEvidence) {
      setMessage("Take a resolution photo before marking the complaint resolved.");
      return;
    }
    if (selectedAction === "false-report" && !actionEvidence) {
      setMessage("Take a camera photo before sending this for admin false-report review.");
      return;
    }
    setActionSubmitting(true);
    try {
      let data;
      let successMessage;
      if (selectedAction === "resolve") {
        data = await api.resolveWorkerComplaint(id, actionNote, actionEvidence);
        successMessage = "Resolution evidence sent to admin for approval. The job moved to review.";
      } else if (selectedAction === "false-report") {
        data = await api.submitWorkerFalseReport(id, actionNote, actionEvidence);
        successMessage = "False-report evidence sent to admin for review. The job moved to review.";
      } else {
        data = await api.requestWorkerMoreTime(id, actionNote);
        successMessage = "More-time request sent to admin and citizen.";
      }
      setComplaint(mapComplaint(data.complaint));
      setActionNote("");
      setActionEvidence(null);
      setActionSubmitted(true);
      setMessage(successMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
      await loadComplaint();
    } catch (error) {
      setMessage(error.message || "Could not submit worker action.");
    } finally {
      setActionSubmitting(false);
    }
  }

  if (!complaint) return <OfficerShell><EmptyState title="Complaint not found" message="No complaint assignment exists for this worker." /></OfficerShell>;

  const startLocked = complaint.rawStatus === "assigned" && !hasReachedLocation;
  const routePoints = [
    workerLocation ? { id: "worker-location", title: "Your current location", ...workerLocation, priority: "High" } : null,
    complaint.latitude && complaint.longitude ? { id: complaint.id, title: "Complaint location", latitude: complaint.latitude, longitude: complaint.longitude, address: complaint.location, priority: complaint.priority } : null,
  ].filter(Boolean);
  const actionLocked = ["false_review", "resolution_review", "resolved", "closed"].includes(complaint.rawStatus);

  return (
    <OfficerShell>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Field Job</h1>
          <p className="text-text-muted">{complaint.department} | {complaint.location}</p>
        </div>
        <div className="flex gap-2"><Badge tone={priorityTone(complaint.priority)}>{complaint.priority}</Badge><Badge tone={statusTone(complaint.status)}>{complaint.status}</Badge></div>
      </div>

      {message ? <p className={`mb-4 rounded-md border p-3 text-sm ${actionSubmitted ? "border-green-200 bg-green-50 text-green-800" : "border-border bg-surface-soft text-text-muted"}`}>{message}</p> : null}
      {actionSubmitted ? <Card className="mb-6 border-green-200 bg-green-50 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="font-bold text-green-800">Submitted successfully</p><p className="text-sm text-green-700">The complaint status has refreshed. Admin can now review the submitted action.</p></div><Link className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white" to="/officer/assigned"><Icon name="arrow_back" /> Back to jobs</Link></div></Card> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-primary">Complaint Details</h2>
            <p className="mb-5 text-text-main">{complaint.text}</p>
            <div className="grid gap-4 md:grid-cols-3">
              <Info label="Category" value={complaint.category} />
              <Info label="AI Confidence" value={`${complaint.confidence}%`} />
              <Info label="Sentiment" value={complaint.sentiment} />
              <Info label="SLA Deadline" value={complaint.sla} />
              <Info label="ETA" value={complaint.eta} />
              <Info label="Citizen Proof" value={complaint.hasCitizenProof ? `${complaint.citizenProofCount} file(s)` : "Not uploaded"} />
            </div>
            <div className="mt-5 grid gap-3 rounded-md border border-border bg-surface-soft p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div><p className="text-sm font-bold text-primary">Route before work starts</p><p className="text-sm text-text-muted">Generate a bike route from your current location, then mark reached to unlock Start Work.</p></div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={enableRoute} disabled={routeLoading || !["assigned", "in_progress"].includes(complaint.rawStatus)}><Icon name="route" /> {routeLoading ? "Generating" : route ? "Refresh Route" : "Enable Route"}</Button>
                  <Button type="button" variant="secondary" onClick={markReachedLocation} disabled={!route || hasReachedLocation || !["assigned", "in_progress"].includes(complaint.rawStatus)}><Icon name="my_location" /> {hasReachedLocation ? "Reached" : "I Have Reached"}</Button>
                </div>
              </div>
              {route ? <div className="grid gap-3 md:grid-cols-2"><Info label="Route Distance" value={formatRouteDistance(route.distance_meters)} /><Info label="Estimated Travel Time" value={formatRouteDuration(route.duration_seconds)} /></div> : null}
              {startLocked ? <p className="text-sm font-semibold text-amber-700">Start Work will unlock after route is enabled and you mark that you reached the complaint location.</p> : null}
              <Button type="button" variant="secondary" onClick={startJob} disabled={startLocked || ["in_progress", "false_review", "resolution_review", "resolved", "closed"].includes(complaint.rawStatus)}><Icon name={complaint.rawStatus === "in_progress" ? "construction" : "play_arrow"} />{complaint.rawStatus === "in_progress" ? "Work In Progress" : complaint.rawStatus === "resolution_review" ? "Waiting For Admin Review" : complaint.rawStatus === "false_review" ? "False Review Pending" : complaint.rawStatus === "resolved" ? "Resolved" : startLocked ? "Reach Location First" : "Start Work"}</Button>
            </div>
          </Card>

          {complaint.attachments.length ? <Card className="p-6"><h2 className="mb-4 font-display text-xl font-bold text-primary">Uploaded Evidence</h2><AttachmentList attachments={complaint.attachments} /></Card> : null}

          <Card className="p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-primary">Worker Action</h2>
            {actionLocked ? <p className="rounded-md border border-border bg-surface-soft p-3 text-sm text-text-muted">This action is already submitted or closed. Admin review is pending where applicable.</p> : (
              <form className="grid gap-4" onSubmit={submitWorkerAction}>
                <Field label="Choose action"><select className={inputClass} value={selectedAction} onChange={(event) => { setSelectedAction(event.target.value); setActionEvidence(null); setActionSubmitted(false); }}><option value="resolve">Resolved with photo verification</option><option value="false-report">Mark false for admin review</option><option value="more-time">It will take more time</option></select></Field>
                {selectedAction !== "more-time" ? <CameraCapture label={selectedAction === "resolve" ? "Resolution camera photo" : "False-report camera photo"} value={actionEvidence} onCapture={setActionEvidence} /> : null}
                <Field label="Worker note"><textarea className={`${inputClass} min-h-24`} value={actionNote} onChange={(event) => setActionNote(event.target.value)} placeholder={selectedAction === "resolve" ? "Explain the repair or action completed..." : selectedAction === "false-report" ? "Explain what was found at the place..." : "Explain why more time is needed..."} /></Field>
                <Button type="submit" disabled={actionSubmitting} variant={selectedAction === "false-report" ? "outline" : selectedAction === "more-time" ? "secondary" : "primary"}><Icon name={selectedAction === "resolve" ? "check_circle" : selectedAction === "false-report" ? "fact_check" : "schedule"} />{actionSubmitting ? "Submitting..." : "Submit Action"}</Button>
              </form>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-5"><h2 className="mb-4 font-display text-lg font-bold text-primary">Complaint Route</h2><LiveMap points={routePoints} center={workerLocation || (complaint.latitude && complaint.longitude ? { latitude: complaint.latitude, longitude: complaint.longitude } : undefined)} routeCoordinates={route?.coordinates || []} height={280} zoom={14} label="Complaint route" /><div className="mt-3 space-y-1 text-sm text-text-muted"><p>Worker location: {workerLocation ? "available" : "waiting for permission"}</p><p>Complaint location: {complaint.latitude && complaint.longitude ? complaint.location : "coordinates missing"}</p></div></Card>
          <Card className="p-5"><h2 className="mb-3 font-display text-lg font-bold text-primary">Field Rules</h2><div className="space-y-3 text-sm text-text-muted"><p>False report requests go to admin first. Worker evidence alone does not block the citizen.</p><p>Resolved status requires a fresh camera photo from the location.</p><p>Queue order still follows priority: critical, high, medium, then low.</p></div></Card>
        </aside>
      </div>
    </OfficerShell>
  );
}

function CameraCapture({ label, value, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const readinessTimerRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  function clearReadinessTimer() {
    if (readinessTimerRef.current) {
      window.clearTimeout(readinessTimerRef.current);
      readinessTimerRef.current = null;
    }
  }

  function waitForVideoFrame(video, attempts = 0) {
    if (!video || !streamRef.current) return;
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      clearReadinessTimer();
      setCameraReady(true);
      setError("");
      return;
    }
    if (attempts > 80) {
      setCameraReady(false);
      setError("Camera opened but no video frame was received. Close other camera apps, allow browser camera permission, then retry.");
      return;
    }
    window.requestAnimationFrame(() => waitForVideoFrame(video, attempts + 1));
  }

  async function attachStreamToVideo(video = videoRef.current) {
    if (!video || !streamRef.current) return;
    video.srcObject = streamRef.current;
    try {
      await video.play();
    } catch {
      // Browser may wait for metadata before play resolves.
    }
    waitForVideoFrame(video);
  }

  function stopCamera() {
    clearReadinessTimer();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
    setCameraReady(false);
  }

  async function openCamera() {
    setError("");
    setCameraReady(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera is not available in this browser.");
      return;
    }
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      setCameraOpen(true);
      window.setTimeout(() => attachStreamToVideo(), 0);
      readinessTimerRef.current = window.setTimeout(() => {
        if (!cameraReady) setError("Camera is taking too long to start. Try Cancel and Open Camera again.");
      }, 7000);
    } catch {
      setError("Camera permission was denied or no camera was found.");
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !cameraReady || !video.videoWidth || !video.videoHeight) {
      setError("Camera is still starting. Wait until preview is visible, then capture.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Could not capture photo. Try again.");
        return;
      }
      const file = new File([blob], `field-evidence-${Date.now()}.jpg`, { type: "image/jpeg" });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      onCapture(file);
      stopCamera();
    }, "image/jpeg", 0.92);
  }

  useEffect(() => {
    if (cameraOpen) attachStreamToVideo();
  }, [cameraOpen]);

  useEffect(() => {
    if (!value && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  }, [value, previewUrl]);

  useEffect(() => () => {
    stopCamera();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <Field label={label}>
      <div className="grid gap-3 rounded-md border border-border bg-surface-soft p-3">
        {cameraOpen ? <video ref={videoRef} className="aspect-video w-full rounded-md bg-black object-cover" autoPlay playsInline muted onLoadedMetadata={(event) => attachStreamToVideo(event.currentTarget)} onCanPlay={(event) => waitForVideoFrame(event.currentTarget)} /> : previewUrl ? <img className="aspect-video w-full rounded-md object-cover" src={previewUrl} alt="Captured field evidence" /> : <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-border bg-white text-sm text-text-muted">No live photo captured yet</div>}
        <div className="flex flex-wrap gap-2">
          {!cameraOpen ? <Button type="button" variant="secondary" onClick={openCamera}><Icon name="photo_camera" /> Open Camera</Button> : <><Button type="button" variant="primary" onClick={capturePhoto} disabled={!cameraReady}><Icon name="camera" /> {cameraReady ? "Capture Photo" : "Starting Camera"}</Button><Button type="button" variant="outline" onClick={stopCamera}>Cancel</Button></>}
          {value ? <Badge tone="green">Photo captured</Badge> : null}
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </div>
    </Field>
  );
}

function Info({ label, value }) {
  return <div><p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p><p className="mt-1 font-semibold text-primary">{value}</p></div>;
}

function AttachmentList({ attachments }) {
  return <div className="grid gap-3 sm:grid-cols-2">{attachments.map((item, index) => <a key={`${item.url || item.name}-${index}`} className="rounded-md border border-border bg-surface-soft p-3 text-sm font-semibold text-primary hover:border-secondary" href={resolveMediaUrl(item.url)} target="_blank" rel="noreferrer"><Icon name={String(item.content_type || "").startsWith("video") ? "videocam" : "image"} /><span className="ml-2">{item.name || `Evidence ${index + 1}`}</span><p className="mt-1 text-xs font-normal text-text-muted">{item.purpose || "proof"}</p></a>)}</div>;
}

function EmptyState({ title, message }) {
  return <Card className="p-8 text-center"><Icon name="inbox" className="mx-auto mb-3 text-4xl text-text-muted" /><h2 className="font-display text-xl font-bold text-primary">{title}</h2><p className="mt-2 text-sm text-text-muted">{message}</p></Card>;
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
    latitude: item.latitude,
    longitude: item.longitude,
    submittedAtRaw: item.created_at || "",
    sla: item.sla_deadline ? formatDateTime(item.sla_deadline) : "Waiting for admin response",
    eta: item.eta_approved && item.estimated_resolution_hours ? `${item.estimated_resolution_hours} hours` : "Waiting for admin response",
    sentiment: item.sentiment || "-",
    summary: item.summary || "",
    attachments: item.attachments || [],
    hasCitizenProof: Boolean(item.has_citizen_proof),
    citizenProofCount: item.citizen_proof_count || 0,
  };
}

function humanize(value) {
  return String(value).replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDistance(complaint, workerLocation) {
  if (!workerLocation || !complaint.latitude || !complaint.longitude) return "-";
  const distance = haversineKm(workerLocation.latitude, workerLocation.longitude, complaint.latitude, complaint.longitude);
  return `${distance.toFixed(1)} km`;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const radius = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}