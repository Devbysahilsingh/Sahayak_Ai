import { Text, View } from "react-native";

const colorByStatus: Record<string, string> = {
  resolved: "bg-emerald-500/20 text-emerald-200",
  assigned: "bg-sky-500/20 text-sky-200",
  in_progress: "bg-amber/20 text-amber-200",
  rejected: "bg-danger/20 text-red-100",
  escalated: "bg-purple-500/20 text-purple-100"
};

export function StatusPill({ status }: { status?: string }) {
  const key = status || "pending";
  const color = colorByStatus[key] || "bg-white/10 text-text";
  return (
    <View className={`self-start rounded-full px-3 py-1 ${color.split(" ")[0]}`}>
      <Text className={`text-xs font-bold uppercase ${color.split(" ")[1]}`}>{key.replace(/_/g, " ")}</Text>
    </View>
  );
}
