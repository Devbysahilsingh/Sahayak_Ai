export type Role = "citizen" | "officer" | "worker" | "admin" | "super_admin";

export type User = {
  id: string | number;
  name?: string;
  mobile_number?: string;
  mobile?: string;
  role: Role;
  department?: string;
};

export type LocationPoint = {
  latitude: number;
  longitude: number;
  address?: string;
  ward?: string;
  landmark?: string;
};

export type ComplaintStatus =
  | "submitted"
  | "pending"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected"
  | "escalated";

export type Complaint = {
  id: string;
  title?: string;
  description: string;
  category?: string;
  department?: string;
  priority?: "low" | "medium" | "high" | "critical";
  status: ComplaintStatus | string;
  created_at?: string;
  updated_at?: string;
  location?: LocationPoint;
  citizen?: User;
  citizen_name?: string;
  citizen_mobile?: string;
  complaint_for?: "self" | "known_member";
  attachments?: Attachment[];
  citizen_proof_location?: ProofLocation;
  worker_location?: LocationPoint;
  assigned_worker?: User;
  admin_response?: string;
};

export type ProofLocation = {
  latitude?: number;
  longitude?: number;
  matched?: boolean;
  distance_meters?: number;
  justification?: string;
};

export type Attachment = {
  id?: string | number;
  url?: string;
  file?: string;
  type?: string;
  label?: string;
};

export type NotificationItem = {
  id: string | number;
  title: string;
  message: string;
  created_at?: string;
  read?: boolean;
};

export type DashboardStats = {
  total?: number;
  pending?: number;
  resolved?: number;
  high_priority?: number;
  assigned?: number;
};

export type ApiList<T> = {
  results?: T[];
  count?: number;
};
