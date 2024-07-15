import { StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { NoteItem } from "@/components/NoteItem";
import { Divider } from "@/components/Divider";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { ThemedButton } from "@/components/ThemedButton";
import { Note, useStateContext } from "@/hooks/NoteContext";
import { useIsFocused } from "@react-navigation/native";
import { useSession } from "@/hooks/AuthContext";

export default function Index() {
  const router = useRouter();
  const { readNotes, createNote, deleteNote } = useStateContext();
  const [notesList, setNotesList] = useState([]);
  const isFocused = useIsFocused();
  const { session } = useSession();

  const generateNotesList = (
    notes: Map<string, Note>,
    setNotesList: CallableFunction
  ) => {
    let idx = 1;
    const notesList = [];
    if (notes) {
      <Divider key={0} />;
    }
    for (let note of Array.from(notes.values())) {
      notesList.push(
        <NoteItem
          key={idx}
          note={note}
          deleteNote={() =>
            deleteNote(note.id, (n) => {
              setNotesList(generateNotesList(n, setNotesList));
            })
          }
        />
      );
      idx++;
      notesList.push(<Divider key={idx} />);
      idx++;
    }

    return notesList;
  };

  useEffect(() => {
    readNotes((n) => {
      setNotesList(generateNotesList(n, setNotesList));
    });
  }, [isFocused]);

  return (
    <ThemedView style={styles.container}>
      <View style={{ width: "100%" }}>{notesList}</View>
      <ThemedButton
        style={styles.createButton}
        onPress={() => {
          createNote(() => router.push("edit"));
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  createButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 50,
  },
});
