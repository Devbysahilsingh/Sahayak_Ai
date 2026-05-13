import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import {
  ComplaintTrackingPage,
  MyGrievancesPage,
  NotificationsPage,
  SubmissionConfirmedPage,
  SubmitComplaintPage,
} from "./pages/CitizenPages";
import {
  ActiveWorkPage,
  AdminComplaintDetailPage,
  AdminDashboardPage,
  AIRejectionsPage,
  AnalyticsPage,
  ComplaintsQueuePage,
  EscalationsPage,
  ManualReviewPage,
  SettingsPage,
  UserManagementPage,
} from "./pages/AdminPages";
import { OfficerComplaintDetailPage, OfficerDashboardPage } from "./pages/OfficerPages";
import RouteGuard from "./components/RouteGuard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage portal="citizen" />} />
      <Route path="/admin/login" element={<LoginPage portal="admin" />} />
      <Route path="/my-grievances" element={<RouteGuard allowedRoles={["citizen"]}><MyGrievancesPage /></RouteGuard>} />
      <Route path="/submit" element={<RouteGuard allowedRoles={["citizen"]}><SubmitComplaintPage /></RouteGuard>} />
      <Route path="/submitted" element={<RouteGuard allowedRoles={["citizen"]}><SubmissionConfirmedPage /></RouteGuard>} />
      <Route path="/track/:id" element={<RouteGuard allowedRoles={["citizen"]}><ComplaintTrackingPage /></RouteGuard>} />
      <Route path="/notifications" element={<RouteGuard allowedRoles={["citizen"]}><NotificationsPage /></RouteGuard>} />

      <Route path="/admin" element={<RouteGuard allowedRoles={["admin", "super_admin"]}><AdminDashboardPage /></RouteGuard>} />
      <Route path="/admin/complaints" element={<RouteGuard allowedRoles={["admin", "super_admin"]}><ComplaintsQueuePage /></RouteGuard>} />
      <Route path="/admin/rejected" element={<RouteGuard allowedRoles={["admin", "super_admin"]}><AIRejectionsPage /></RouteGuard>} />
      <Route path="/admin/complaints/:id" element={<RouteGuard allowedRoles={["admin", "super_admin"]}><AdminComplaintDetailPage /></RouteGuard>} />
      <Route path="/admin/manual-review" element={<RouteGuard allowedRoles={["admin", "super_admin"]}><ManualReviewPage /></RouteGuard>} />
      <Route path="/admin/active-work" element={<RouteGuard allowedRoles={["admin", "super_admin"]}><ActiveWorkPage /></RouteGuard>} />
      <Route path="/admin/escalations" element={<RouteGuard allowedRoles={["admin", "super_admin"]}><EscalationsPage /></RouteGuard>} />
      <Route path="/admin/users" element={<RouteGuard allowedRoles={["admin", "super_admin"]}><UserManagementPage /></RouteGuard>} />
      <Route path="/admin/analytics" element={<RouteGuard allowedRoles={["admin", "super_admin"]}><AnalyticsPage /></RouteGuard>} />
      <Route path="/admin/settings" element={<RouteGuard allowedRoles={["admin", "super_admin"]}><SettingsPage /></RouteGuard>} />

      <Route path="/officer" element={<RouteGuard allowedRoles={["officer", "admin", "super_admin"]}><OfficerDashboardPage /></RouteGuard>} />
      <Route path="/officer/assigned" element={<RouteGuard allowedRoles={["officer", "admin", "super_admin"]}><OfficerDashboardPage /></RouteGuard>} />
      <Route path="/officer/high-priority" element={<RouteGuard allowedRoles={["officer", "admin", "super_admin"]}><OfficerDashboardPage /></RouteGuard>} />
      <Route path="/officer/overdue" element={<RouteGuard allowedRoles={["officer", "admin", "super_admin"]}><OfficerDashboardPage /></RouteGuard>} />
      <Route path="/officer/resolved" element={<RouteGuard allowedRoles={["officer", "admin", "super_admin"]}><OfficerDashboardPage /></RouteGuard>} />
      <Route path="/officer/complaints/:id" element={<RouteGuard allowedRoles={["officer", "admin", "super_admin"]}><OfficerComplaintDetailPage /></RouteGuard>} />
    </Routes>
  );
}
