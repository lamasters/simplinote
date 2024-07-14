import { StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { NoteItem } from "@/components/NoteItem";
import { Divider } from "@/components/Divider";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { ThemedButton } from "@/components/ThemedButton";
import { Note, useStateContext } from "@/hooks/NoteContext";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const deleteNote = async (
  id: string,
  notes: Map<string, Note>,
  setNotes: CallableFunction,
  setNotesList: CallableFunction
) => {
  notes.delete(id);
  await AsyncStorage.removeItem("notes", () => {
    AsyncStorage.setItem(
      "notes",
      JSON.stringify(Array.from(notes.entries())),
      () => {
        setNotes(notes);
        setNotesList(generateNotesList(notes, setNotes, setNotesList));
      }
    );
  });
};

const generateNotesList = (
  notes: Map<string, Note>,
  setNotes: CallableFunction,
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
        deleteNote={() => deleteNote(note.id, notes, setNotes, setNotesList)}
      />
    );
    idx++;
    notesList.push(<Divider key={idx} />);
    idx++;
  }

  return notesList;
};

export default function Index() {
  const { notes, setNotes, setCurrentNote } = useStateContext();
  const [notesList, setNotesList] = useState([]);
  const isFocused = useIsFocused();
  const router = useRouter();

  const fetchNotes = async () => {
    try {
      const data = await AsyncStorage.getItem("notes");
      if (data) {
        let loadedNotes = new Map<string, Note>();
        const parsedNotes = JSON.parse(data);
        for (let item of parsedNotes) {
          let id = item[0];
          let note = item[1];
          if (!id) {
            continue;
          }
          loadedNotes.set(id, {
            id: id,
            title: note["title"],
            content: note["content"],
          });
        }
        setNotes(loadedNotes);
        setNotesList(generateNotesList(loadedNotes, setNotes, setNotesList));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [isFocused]);

  const createNote = async () => {
    const newNote = {
      id: Math.random().toString(36).substring(7),
      title: "Untitled Note",
      content: "",
    };

    notes.set(newNote.id, newNote);
    setNotes(notes);
    setCurrentNote(newNote.id);
    await AsyncStorage.setItem(
      "notes",
      JSON.stringify(Array.from(notes.entries())),
      () => {
        router.push("edit");
      }
    );
  };

  // Fetch notes from the server

  return (
    <ThemedView style={styles.container}>
      <View style={{ width: "100%" }}>{notesList}</View>
      <ThemedButton
        style={styles.createButton}
        onPress={() => {
          createNote();
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
