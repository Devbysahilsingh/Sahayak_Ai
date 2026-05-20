import { Complaint, NotificationItem } from "@/types/domain";

export const mockComplaints: Complaint[] = [
  {
    id: "CMP-1001",
    title: "Broken street light",
    description: "Street light is not working near the community park.",
    category: "Electricity",
    department: "Electrical",
    priority: "medium",
    status: "assigned",
    created_at: new Date().toISOString(),
    location: { latitude: 28.6139, longitude: 77.209, address: "Central Delhi" }
  },
  {
    id: "CMP-1002",
    title: "Garbage overflow",
    description: "Waste bin has not been cleared for three days.",
    category: "Sanitation",
    department: "Municipal",
    priority: "high",
    status: "in_progress",
    created_at: new Date().toISOString(),
    location: { latitude: 28.61, longitude: 77.21, address: "Ward 12" }
  }
];

export const mockNotifications: NotificationItem[] = [
  { id: 1, title: "Complaint assigned", message: "Your complaint has been assigned to a worker." },
  { id: 2, title: "Worker nearby", message: "A field worker is moving towards the complaint location." }
];
