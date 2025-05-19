import { EventSubscription } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { PhotoProvider } from "./context/PhotoContext";
import { TabBarVisibilityProvider } from "./context/TabBarVisibilityContext";
import "./globals.css";

export default function RootLayout() {
  const router = useRouter();
  const responseListener = useRef<EventSubscription>(undefined);

  useEffect(() => {
    // Handle notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        const photoId = data.photoId as string;
        
        if (photoId) {
          console.log('Navigating to photo:', photoId);
          router.push({
            pathname: "/gallery",
            params: { photoId }
          });
        }
      }
    );

    // Clean up
    return () => {
      if (responseListener.current) {
        Notifications
        responseListener.current.remove();
      }
    };
  }, [router]);

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