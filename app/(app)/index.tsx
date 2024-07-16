import { Note, useStateContext } from "@/hooks/NoteContext";
import { StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";

import { Divider } from "@/components/Divider";
import { NoteItem } from "@/components/NoteItem";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedView } from "@/components/ThemedView";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const { readNotes, createNote, deleteNote } = useStateContext();
  const [notesList, setNotesList] = useState([]);
  const isFocused = useIsFocused();

  const generateNotesList = (
    notes: Map<string, Note>,
    setNotesList: CallableFunction
  ) => {
    let idx = 1;
    const notesList = [];
    if (notes) {
      <Divider key={0} />;
    }
    const notesArray = Array.from(notes.values());
    notesArray.sort((a, b) => {return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()});
    for (let note of notesArray) {
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
