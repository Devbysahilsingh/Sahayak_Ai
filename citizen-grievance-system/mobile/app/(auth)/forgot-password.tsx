import { router } from "expo-router";
import { Text } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";

export default function ForgotPassword() {
  return (
    <Screen>
      <Text className="pt-8 text-3xl font-black text-text">Recover access</Text>
      <GlassCard className="gap-4">
        <Text className="text-muted">This app uses OTP login. Generate a new OTP on the login screen to recover access.</Text>
        <AppInput label="Mobile Number" keyboardType="phone-pad" placeholder="9876543210" />
        <AppButton title="Back to Login" onPress={() => router.replace("/(auth)/login")} />
      </GlassCard>
    </Screen>
  );
}
