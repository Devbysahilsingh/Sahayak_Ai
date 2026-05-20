import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export function LoadingSkeleton({ className = "h-24 rounded-3xl" }: { className?: string }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.75, duration: 850, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 850, useNativeDriver: true })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View className={`bg-white/10 ${className}`} style={{ opacity }} />;
}
