import { Slot } from "expo-router";
import { StateProvider } from "@/hooks/NoteContext";

export default function RootLayout() {
  return (
    <StateProvider>
      <Slot />
    </StateProvider>
  );
}
