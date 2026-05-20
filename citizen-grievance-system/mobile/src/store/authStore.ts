import { create } from "zustand";
import { User } from "@/types/domain";
import { storage } from "@/services/storage";

type Session = {
  token: string;
  user: User;
};

type AuthState = {
  hydrated: boolean;
  token: string | null;
  user: User | null;
  role: User["role"] | null;
  hydrate: () => Promise<void>;
  setSession: (session: Session) => Promise<void>;
  logout: () => Promise<void>;
};

const TOKEN_KEY = "sahayak.mobile.token";
const USER_KEY = "sahayak.mobile.user";

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  token: null,
  user: null,
  role: null,
  hydrate: async () => {
    const [token, rawUser] = await Promise.all([storage.get(TOKEN_KEY), storage.get(USER_KEY)]);
    const user = rawUser ? (JSON.parse(rawUser) as User) : null;
    set({ token, user, role: user?.role ?? null, hydrated: true });
  },
  setSession: async ({ token, user }) => {
    await Promise.all([storage.set(TOKEN_KEY, token), storage.set(USER_KEY, JSON.stringify(user))]);
    set({ token, user, role: user.role });
  },
  logout: async () => {
    await Promise.all([storage.remove(TOKEN_KEY), storage.remove(USER_KEY)]);
    set({ token: null, user: null, role: null });
  }
}));
