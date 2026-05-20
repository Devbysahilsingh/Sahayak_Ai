import { create } from "zustand";

export type OfflineComplaintDraft = {
  id: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

type OfflineState = {
  drafts: OfflineComplaintDraft[];
  addDraft: (payload: Record<string, unknown>) => void;
  removeDraft: (id: string) => void;
  clearDrafts: () => void;
};

export const useOfflineStore = create<OfflineState>((set) => ({
  drafts: [],
  addDraft: (payload) =>
    set((state) => ({
      drafts: [{ id: `${Date.now()}`, payload, createdAt: new Date().toISOString() }, ...state.drafts]
    })),
  removeDraft: (id) => set((state) => ({ drafts: state.drafts.filter((draft) => draft.id !== id) })),
  clearDrafts: () => set({ drafts: [] })
}));
