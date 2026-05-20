import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import { Complaint } from "@/types/domain";

export function ComplaintCard({ complaint, base = "citizen" }: { complaint: Complaint; base?: "citizen" | "worker" }) {
  return (
    <Pressable onPress={() => router.push(`/(tabs)/${base}/complaint/${complaint.id}` as any)}>
      <GlassCard className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-text">{complaint.title || complaint.category || `Complaint ${complaint.id}`}</Text>
            <Text className="mt-1 text-sm leading-5 text-muted" numberOfLines={2}>
              {complaint.description}
            </Text>
          </View>
          <StatusPill status={complaint.status} />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">{complaint.department || "Department pending"}</Text>
          <Text className="text-xs font-semibold text-amber">{complaint.priority || "normal"}</Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}
