import { Note, useStateContext } from "@/hooks/NoteContext";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";

import { Divider } from "@/components/Divider";
import { NoteItem } from "@/components/NoteItem";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSession } from "@/hooks/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { ActionSheet } from "@/components/ActionSheet";

export default function Index() {
  const router = useRouter();
  const { readNotes, createNote, deleteNote } = useStateContext();
  const [notesList, setNotesList] = useState([]);
  const isFocused = useIsFocused();
  const { newDevices } = useSession();
  const [showDelete, setShowDelete] = useState(false);
  const [deleteNoteId, setDeleteNoteId] = useState("");

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
    notesArray.sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    for (let note of notesArray) {
      notesList.push(
        <NoteItem
          key={idx}
          note={note}
          deleteNote={() => {
            setDeleteNoteId(note.id);
            setShowDelete(true);
          }}
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
      {showDelete ? (
        <ActionSheet
          actions={[
            {
              title: "Delete",
              action: () => {
                deleteNote(deleteNoteId, (n) =>
                  setNotesList(generateNotesList(n, setNotesList))
                );
                setShowDelete(false);
              },
              color: "red",
            },
            {
              title: "Cancel",
              action: () => {
                setShowDelete(false);
              },
            },
          ]}
        />
      ) : null}
      {newDevices.length > 0 ? (
        <TouchableOpacity
          style={styles.newDeviceCard}
          onPress={() => router.push("setup")}
        >
          <Ionicons name="information-circle" size={24} color="#60c0f6" />
          <ThemedText style={{ margin: 10 }}>
            Tap to set up new devices
          </ThemedText>
        </TouchableOpacity>
      ) : null}
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
  newDeviceCard: {
    position: "absolute",
    display: "flex",
    flexDirection: "row",
    bottom: 100,
    left: "5%",
    width: "90%",
    height: 50,
    borderRadius: 10,
    backgroundColor: "rgba(100, 100, 100, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
});
