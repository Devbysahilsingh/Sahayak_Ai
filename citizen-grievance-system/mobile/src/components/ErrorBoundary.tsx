import { Component, PropsWithChildren } from "react";
import { Text } from "react-native";
import { AppButton } from "@/components/AppButton";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";

type State = { error?: Error };

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Screen>
          <GlassCard className="mt-16 gap-4">
            <Text className="text-2xl font-bold text-text">Something went wrong</Text>
            <Text className="text-muted">{this.state.error.message}</Text>
            <AppButton title="Try again" onPress={() => this.setState({ error: undefined })} />
          </GlassCard>
        </Screen>
      );
    }
    return this.props.children;
  }
}
