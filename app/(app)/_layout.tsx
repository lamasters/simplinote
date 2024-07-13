import { Stack } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function AppLayout() {
  const headerColor = useThemeColor({}, "background");
  const headerTintColor = useThemeColor({}, "tint");

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
