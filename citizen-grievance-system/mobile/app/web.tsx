import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type { WebView as WebViewType } from "react-native-webview";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_FRONTEND_URL || "http://10.160.178.28:5173";

export default function WebPortal() {
  const webViewRef = useRef<WebViewType>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goBack() {
    if (canGoBack) {
      webViewRef.current?.goBack();
      return true;
    }
    return false;
  }

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", goBack);
    return () => subscription.remove();
  }, [canGoBack]);

  return (
    <SafeAreaView className="flex-1 bg-ink">
      <View className="flex-row items-center gap-3 border-b border-stroke bg-slate-950 px-4 py-3">
        <Pressable onPress={goBack} className={`h-10 w-10 items-center justify-center rounded-full bg-white/10 ${canGoBack ? "opacity-100" : "opacity-40"}`}>
          <Ionicons name="chevron-back" color="#e5eefb" size={22} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-base font-bold text-text">Sahayak AI Web Portal</Text>
          <Text className="text-xs text-muted" numberOfLines={1}>{WEB_URL}</Text>
        </View>
        <Pressable onPress={() => webViewRef.current?.reload()} className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <Ionicons name="refresh" color="#e5eefb" size={20} />
        </Pressable>
      </View>

      {error ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-center text-xl font-bold text-text">Could not load web portal</Text>
          <Text className="text-center text-muted">{error}</Text>
          <Text className="text-center text-sm text-muted">Make sure frontend is running on port 5173 and phone is on the same Wi-Fi.</Text>
          <Pressable
            onPress={() => {
              setError(null);
              setLoading(true);
              webViewRef.current?.reload();
            }}
            className="rounded-2xl bg-teal px-5 py-3"
          >
            <Text className="font-bold text-white">Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <WebView
            ref={webViewRef}
            source={{ uri: WEB_URL }}
            className="flex-1 bg-white"
            originWhitelist={["*"]}
            javaScriptEnabled
            domStorageEnabled
            cacheEnabled
            cacheMode="LOAD_DEFAULT"
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            geolocationEnabled
            mixedContentMode="always"
            allowsBackForwardNavigationGestures
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={(event) => setCanGoBack(event.canGoBack)}
            onError={(event) => setError(event.nativeEvent.description || "Network request failed.")}
            onHttpError={(event) => setError(`HTTP ${event.nativeEvent.statusCode}`)}
          />
          {loading ? (
            <View className="absolute inset-0 items-center justify-center bg-ink/60">
              <ActivityIndicator color="#14b8a6" size="large" />
            </View>
          ) : null}
        </>
      )}
    </SafeAreaView>
  );
}
