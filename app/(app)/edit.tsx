import { useStateContext } from "@/hooks/NoteContext";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet, TextInput } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useEffect, useState } from "react";

export default function Index() {
  const { notes, currentNote, updateNote } = useStateContext();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

  const updateContent = async (content: string) => {
    setContent(content);
    await updateNote(title, content);
  };

  const updateTitle = async (title: string) => {
    setTitle(title);
    await updateNote(title, content);
  };

  useEffect(() => {
    let note = notes.get(currentNote);
    setContent(note.content);
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
        onChangeText={(text) => updateTitle(text)}
      />
      <TextInput
        style={{ ...styles.textInput, color: textColor }}
        keyboardType="default"
        placeholder="Enter your note here..."
        placeholderTextColor={placeholderColor}
        value={content}
        onChangeText={(text) => updateContent(text)}
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
