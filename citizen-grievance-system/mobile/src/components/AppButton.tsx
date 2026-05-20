import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ActivityIndicator, Pressable, Text } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: keyof typeof Ionicons.glyphMap;
};

const variants = {
  primary: "bg-teal",
  secondary: "bg-white/10 border border-stroke",
  ghost: "bg-transparent",
  danger: "bg-danger"
};

export function AppButton({ title, onPress, loading, disabled, variant = "primary", icon }: Props) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      className={`min-h-12 flex-row items-center justify-center gap-2 rounded-2xl px-5 ${variants[variant]} ${disabled ? "opacity-50" : "opacity-100"}`}
    >
      {loading ? <ActivityIndicator color="#fff" /> : icon ? <Ionicons name={icon} size={18} color="#fff" /> : null}
      <Text className="font-semibold text-white">{title}</Text>
    </Pressable>
  );
}
