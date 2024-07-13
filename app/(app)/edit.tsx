import { useStateContext } from "@/hooks/NoteContext";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet, TextInput } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const { notes, setNotes, currentNote } = useStateContext();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");

  const updateText = async (text: string) => {
    setText(text);
    let note = notes.get(currentNote);
    note.content = text;
    notes.set(currentNote, note);
    setNotes(notes);
    await AsyncStorage.setItem(
      "notes",
      JSON.stringify(Array.from(notes.entries()))
    );
  };

  const updateTitle = async (title: string) => {
    setTitle(title);
    let note = notes.get(currentNote);
    note.title = title;
    notes.set(currentNote, note);
    setNotes(notes);
    await AsyncStorage.setItem(
      "notes",
      JSON.stringify(Array.from(notes.entries()))
    );
  };

  useEffect(() => {
    let note = notes.get(currentNote);
    setText(note.content);
    setTitle(note.title);
  }, [currentNote]);

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");

  return (
    <ThemedView
      style={{
        position: "absolute",
        top: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <TextInput
        style={{
          ...styles.titleInput,
          color: textColor,
        }}
        value={title}
        onChange={(e) => {
          updateTitle(e.nativeEvent.text);
        }}
      />
      <TextInput
        style={{ ...styles.textInput, color: textColor }}
        keyboardType="default"
        placeholder="Enter your note here..."
        placeholderTextColor={placeholderColor}
        value={text}
        onChange={(e) => {
          updateText(e.nativeEvent.text);
        }}
        textAlign="left"
        textAlignVertical="top"
        textBreakStrategy="highQuality"
        multiline={true}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleInput: {
    flexBasis: 50,
    marginLeft: 25,
    marginRight: 25,
    textAlign: "left",
    fontSize: 20,
    padding: 5,
  },
  textInput: {
    flex: 1,
    marginLeft: 25,
    marginRight: 25,
    textAlign: "left",
    textAlignVertical: "top",
    padding: 5,
  },
});
