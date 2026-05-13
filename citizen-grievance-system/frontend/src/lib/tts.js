export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function speakText(text, options = {}) {
  if (!canSpeak() || !text) {
    return false;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || "en-IN";
  utterance.rate = options.rate || 0.92;
  utterance.pitch = options.pitch || 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (canSpeak()) {
    window.speechSynthesis.cancel();
  }
}

export function buildComplaintSpeech(complaint) {
  if (!complaint) {
    return "";
  }
  const status = String(complaint.status || complaint.rawStatus || "").toLowerCase();
  const reason = complaint.rejectionReason || complaint.ai_rejection_reason || "";
  const department = complaint.department || complaint.assigned_department?.name || "";
  const eta =
    complaint.eta ||
    (complaint.eta_approved && complaint.estimated_resolution_hours
      ? `${complaint.estimated_resolution_hours} hours`
      : "waiting for admin response");
  const proofCount = complaint.citizenProofCount || complaint.citizen_proof_count || 0;
  const proofLine = proofCount > 0 ? ` You also uploaded ${proofCount} proof file${proofCount > 1 ? "s" : ""}.` : "";

  if (status.includes("reject")) {
    return `Your complaint was rejected because ${reason || "it does not appear to be a valid government grievance"}.`;
  }
  if (status.includes("resolved")) {
    return "Your complaint has been marked resolved. Please check the details and confirm if the issue is actually fixed.";
  }
  if (status.includes("escalated")) {
    return "Your complaint has been escalated to a higher authority because it was not resolved within the expected time.";
  }
  if (status.includes("manual")) {
    return `Your complaint needs manual review. An officer will verify the correct department.${proofLine}`;
  }
  if (status.includes("processing") || status.includes("submitted")) {
    return `Your complaint has been submitted successfully and is being analyzed by the system.${proofLine}`;
  }
  return `Your complaint is currently ${complaint.status || "being processed"}. Department is ${department || "not assigned yet"}. Estimated resolution is ${eta}.`;
}

export function buildNotificationSpeech(notification) {
  if (!notification) {
    return "";
  }
  const title = notification.title || "Notification";
  const message = notification.message || "";
  return `${title}. ${message}`.replace(/\b[A-Z]{2,}-\d+\b/g, "").replace(/\s+/g, " ").trim();
}
