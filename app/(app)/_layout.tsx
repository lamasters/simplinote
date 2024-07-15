import { Stack } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSession } from "@/hooks/AuthContext";
import { useEffect } from "react";
import { Client, Account } from "react-native-appwrite";
import { useRouter } from "expo-router";

export default function AppLayout() {
  const headerColor = useThemeColor({}, "background");
  const headerTintColor = useThemeColor({}, "tint");
  const { session, setSession } = useSession();
  const router = useRouter();
  const client = new Client();
  client
    .setEndpoint("https://homelab.hippogriff-lime.ts.net/v1")
    .setProject("6693316c000be6973e37")
    .setPlatform("com.lamasters.simplinote");

  const account = new Account(client);

  const checkSession = async () => {
    if (!session) {
      let newSession = await account.get();
      if (newSession) {
        setSession(newSession);
      } else {
        router.replace("/login");
      }
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Notes",
          headerTintColor: headerTintColor,
          headerStyle: {
            backgroundColor: headerColor,
          },
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit",
          headerTintColor: headerTintColor,
          headerStyle: {
            backgroundColor: headerColor,
          },
        }}
      />
    </Stack>
  );
}
