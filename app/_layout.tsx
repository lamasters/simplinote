import { AuthProvider } from "@/hooks/AuthContext";
import { Slot } from "expo-router";
import { StateProvider } from "@/hooks/NoteContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StateProvider>
        <Slot />
      </StateProvider>
    </AuthProvider>
  );
}
