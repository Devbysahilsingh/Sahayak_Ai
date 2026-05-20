import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { ViewProps } from "react-native";

export function GlassCard({ children, className = "" }: PropsWithChildren<ViewProps & { className?: string }>) {
  return (
    <LinearGradient
      colors={["rgba(15,23,42,0.88)", "rgba(15,23,42,0.58)"]}
      className={`overflow-hidden rounded-3xl border border-stroke p-5 ${className}`}
    >
      {children}
    </LinearGradient>
  );
}
