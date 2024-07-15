import { Slot } from "expo-router";
import { StateProvider } from "@/hooks/NoteContext";
import { AuthProvider } from "@/hooks/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StateProvider>
        <Slot />
      </StateProvider>
    </AuthProvider>
  );
}
