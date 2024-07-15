import { Redirect, Stack } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSession } from "@/hooks/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function AppLayout() {
  const headerColor = useThemeColor({}, "background");
  const headerTintColor = useThemeColor({}, "tint");
  const { loading, session } = useSession();

  if (loading) {
    return (
      <ThemedView>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!session.$id) {
    return <Redirect href="/login" />;
  }

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
