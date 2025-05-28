import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const islogin = false;
  const router = useRouter();
  useEffect(() => {
    if (!islogin) {
      router.replace("/login");
    }
  });
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
