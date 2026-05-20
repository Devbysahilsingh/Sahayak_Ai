import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { Role } from "@/types/domain";

const roles: { label: string; value: Role }[] = [
  { label: "Citizen", value: "citizen" },
  { label: "Worker", value: "officer" },
  { label: "Admin", value: "admin" }
];

export default function Login() {
  const setSession = useAuthStore((state) => state.setSession);
  const [role, setRole] = useState<Role>("citizen");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    setLoading(true);
    try {
      const data = await api.sendOtp(mobile);
      setOtp(data.dev_otp || "");
      setMessage(data.note || "OTP sent.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setLoading(true);
    try {
      const data = await api.verifyOtp(mobile, otp);
      const userRole = data.user?.role as Role;
      const allowed =
        role === "admin" ? userRole === "admin" || userRole === "super_admin" : role === "officer" ? userRole === "officer" : userRole === "citizen";
      if (!allowed) {
        setMessage("This account does not match the selected role.");
        return;
      }
      await setSession({ token: data.token, user: data.user });
      router.replace(userRole === "citizen" ? "/(tabs)/citizen" : "/(tabs)/worker");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="pt-8">
        <Text className="text-4xl font-black text-text">Sahayak AI</Text>
        <Text className="mt-2 text-base text-muted">Mobile grievance reporting for citizens and field workers.</Text>
      </View>
      <GlassCard className="gap-5">
        <View className="flex-row gap-2">
          {roles.map((item) => (
            <View className="flex-1" key={item.value}>
              <AppButton title={item.label} variant={role === item.value ? "primary" : "secondary"} onPress={() => setRole(item.value)} />
            </View>
          ))}
        </View>
        <AppInput label="Mobile Number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" placeholder="9876543210" />
        <AppButton title="Generate OTP" icon="chatbubble-ellipses" loading={loading} disabled={mobile.length < 10} onPress={sendOtp} />
        <AppInput label="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} placeholder="000000" />
        <AppButton title="Verify and Continue" icon="arrow-forward" loading={loading} disabled={otp.length < 6} onPress={verify} />
        {message ? <Text className="text-sm text-muted">{message}</Text> : null}
        <AppButton title="Worker Register" variant="ghost" onPress={() => router.push("/(auth)/register")} />
        <AppButton title="Forgot Password" variant="ghost" onPress={() => router.push("/(auth)/forgot-password")} />
      </GlassCard>
    </Screen>
  );
}
