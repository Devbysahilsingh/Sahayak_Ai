import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { api } from "@/services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.listDepartments().then((data) => setDepartments(data.results || [])).catch(() => setDepartments([]));
  }, []);

  async function submit() {
    const data = await api.signupWorker({ name, mobile_number: mobile, department_id: departmentId || departments[0]?.id });
    setMessage(data.note || `Worker created. OTP: ${data.dev_otp || ""}`);
  }

  return (
    <Screen>
      <Text className="pt-8 text-3xl font-black text-text">Worker Register</Text>
      <GlassCard className="gap-4">
        <AppInput label="Name" value={name} onChangeText={setName} />
        <AppInput label="Mobile" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
        <AppInput label="Department ID" value={departmentId} onChangeText={setDepartmentId} placeholder={departments[0]?.id || "Department id"} />
        <AppButton title="Create Worker" icon="construct" onPress={submit} />
        {message ? <Text className="text-muted">{message}</Text> : null}
        <AppButton title="Back to Login" variant="ghost" onPress={() => router.back()} />
      </GlassCard>
    </Screen>
  );
}
