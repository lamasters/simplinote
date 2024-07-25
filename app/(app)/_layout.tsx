import { Redirect, Stack } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSession } from "@/hooks/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleSheet } from "react-native";

export default function AppLayout() {
  const headerColor = useThemeColor({}, "background");
  const headerTintColor = useThemeColor({}, "tint");
  const { loading, session, accountKey } = useSession();

  if (loading) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (!accountKey) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>Log in on an existing device to complete setup</ThemedText>
      </ThemedView>
    );
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
