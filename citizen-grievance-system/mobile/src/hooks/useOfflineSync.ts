import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";
import { api } from "@/services/api";
import { queryClient } from "@/services/queryClient";
import { useOfflineStore } from "@/store/offlineStore";

export function useOfflineSync() {
  const drafts = useOfflineStore((state) => state.drafts);
  const removeDraft = useOfflineStore((state) => state.removeDraft);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (!state.isConnected || drafts.length === 0) return;
      for (const draft of drafts) {
        try {
          await api.createComplaint(draft.payload);
          removeDraft(draft.id);
        } catch {
          break;
        }
      }
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    });
    return unsubscribe;
  }, [drafts, removeDraft]);
}
