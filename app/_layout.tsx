import { Stack } from "expo-router";
import { PhotoProvider } from "./context/PhotoContext";
import { TabBarVisibilityProvider } from "./context/TabBarVisibilityContext";




export default function RootLayout() {
  return (
      <PhotoProvider>
        <TabBarVisibilityProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </TabBarVisibilityProvider>
      </PhotoProvider>

  );
}
