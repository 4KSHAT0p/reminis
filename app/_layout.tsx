import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";

// function RouteGuard({ children }: { children: React.ReactNode }) {
//   const [isMounted, setIsMounted] = useState(false);
//   const islogin = false;
//   const router = useRouter();

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   useEffect(() => {
//     if (!isMounted) return;

//     if (!islogin) {
//       router.replace("/login");
//     }
//   }, [isMounted, islogin]);

//   return <>{children}</>;
// }

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
      <Stack.Screen name="login" options={{ headerShown: true }} />
    </Stack>
  );
}
