import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native";
import { ComplaintCard } from "@/components/ComplaintCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Screen } from "@/components/Screen";
import { mockComplaints } from "@/data/mockData";
import { api } from "@/services/api";

export default function CitizenComplaints() {
  const query = useQuery({ queryKey: ["complaints", "citizen"], queryFn: () => api.listComplaints() });
  const rows = query.data?.results || mockComplaints;

  return (
    <Screen>
      <Text className="pt-8 text-3xl font-black text-text">Complaint History</Text>
      {query.isLoading ? <LoadingSkeleton /> : rows.map((item) => <ComplaintCard key={item.id} complaint={item} />)}
    </Screen>
  );
}
