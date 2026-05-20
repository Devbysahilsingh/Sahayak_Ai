import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const body = scroll ? (
    <ScrollView className="flex-1" contentContainerClassName="gap-5 px-5 pb-8" keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View className="flex-1 px-5 pb-8">{children}</View>
  );

  return (
    <LinearGradient colors={["#07101f", "#0f172a", "#111827"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
          {body}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
