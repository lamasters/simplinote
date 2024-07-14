import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Note, useStateContext } from "@/hooks/NoteContext";
import { ThemedText } from "./ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

type Props = {
  note: Note;
  deleteNote: CallableFunction;
};

export function NoteItem(props: Props) {
  const router = useRouter();
  const { setCurrentNote } = useStateContext();
  const iconColor = useThemeColor({}, "icon");
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        setCurrentNote(props.note.id);
        router.push("edit");
      }}
      onLongPress={() => {
        props.deleteNote(props.note.id);
      }}
    >
      <ThemedText style={styles.title}>{props.note.title}</ThemedText>
      <Ionicons name="chevron-forward-outline" size={18} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    width: "100%",
  },
  title: {
    position: "relative",
    margin: "auto",
  },
});
