import { Text, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & {
  label: string;
};

export function AppInput({ label, className = "", ...props }: Props) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-muted">{label}</Text>
      <TextInput
        placeholderTextColor="#64748b"
        className={`min-h-12 rounded-2xl border border-stroke bg-white/8 px-4 text-base text-text ${className}`}
        {...props}
      />
    </View>
  );
}
