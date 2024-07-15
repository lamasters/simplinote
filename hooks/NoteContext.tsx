import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ID } from "react-native-appwrite";
import { Callback } from "@react-native-async-storage/async-storage/lib/typescript/types";

export type Note = {
  id: string;
  title: string;
  content: string;
};

export type State = {
  notes: Map<string, Note>;
  setNotes: CallableFunction;
  currentNote: string | null;
  setCurrentNote: CallableFunction;
  createNote: CallableFunction;
  readNotes: CallableFunction;
  updateNote: CallableFunction;
  deleteNote: CallableFunction;
};

const StateContext = React.createContext<State>({
  notes: new Map(),
  setNotes: () => null,
  currentNote: null,
  setCurrentNote: () => null,
  createNote: () => null,
  readNotes: () => null,
  updateNote: () => null,
  deleteNote: () => null,
});

export function useStateContext() {
  const value = React.useContext(StateContext);
  if (!value) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return value;
}

export function StateProvider(props: React.PropsWithChildren) {
  const [notes, setNotes] = React.useState<Map<string, Note>>(new Map());
  const [currentNote, setCurrentNote] = React.useState<string | null>(null);

  const readNotes = async (callback: CallableFunction) => {
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
        callback(loadedNotes);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNote = async (id: string, callback: CallableFunction) => {
    notes.delete(id);
    setNotes(notes);
    await AsyncStorage.setItem(
      "notes",
      JSON.stringify(Array.from(notes.entries())),
      callback(notes)
    );
  };

  const createNote = async (callback: Callback) => {
    const newNote = {
      id: ID.unique(),
      title: "Untitled Note",
      content: "",
    };

    notes.set(newNote.id, newNote);
    setNotes(notes);
    setCurrentNote(newNote.id);
    await AsyncStorage.setItem(
      "notes",
      JSON.stringify(Array.from(notes.entries())),
      callback
    );
  };

  const updateNote = async (title: string, text: string) => {
    let note = notes.get(currentNote);
    note.title = title;
    note.content = text;
    notes.set(currentNote, note);
    setNotes(notes);
    await AsyncStorage.setItem(
      "notes",
      JSON.stringify(Array.from(notes.entries()))
    );
  };

  return (
    <StateContext.Provider
      value={{
        notes,
        setNotes,
        currentNote,
        setCurrentNote,
        createNote,
        readNotes,
        updateNote,
        deleteNote,
      }}
    >
      {props.children}
    </StateContext.Provider>
  );
}
