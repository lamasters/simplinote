import AsyncStorage from "@react-native-async-storage/async-storage";
import { Callback } from "@react-native-async-storage/async-storage/lib/typescript/types";
import { ID } from "react-native-appwrite";
import React from "react";
import { useSession } from "@/hooks/AuthContext";

export type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  archived: boolean;
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
  const {
    createNote: createCloudNote,
    updateNote: updateCloudNote,
    deleteNote: deleteCloudNote,
    readNotes: readCloudNotes,
  } = useSession();

  const readNotes = async (callback: CallableFunction) => {
    try {
      const results = await Promise.allSettled([
        readCloudNotes(),
        AsyncStorage.getItem("notes"),
      ]);
      let cloudRes = results[0];
      let localRes = results[1];
      let cloudNotes = new Map<string, Note>();
      if (cloudRes.status === "fulfilled") {
        for (let item of cloudRes.value["documents"]) {
          let id = item.$id;

          let note = item;
          if (!id) {
            continue;
          }
          cloudNotes.set(id, {
            id: id,
            title: note["title"],
            content: note["content"],
            created_at: note["created_at"],
            archived: note["archived"],
          });
        }
      }
      let localNotes = new Map<string, Note>();
      if (localRes.status === "fulfilled") {
        const parsedNotes = JSON.parse(localRes.value);
        for (let item of parsedNotes) {
          let id = item[0];
          let note = item[1];
          if (!id) {
            continue;
          }
          localNotes.set(id, {
            id: id,
            title: note["title"],
            content: note["content"],
            created_at: note["created_at"],
            archived: note["archived"],
          });
        }
      }

      if (localNotes.size > 0) {
        localNotes.forEach(async (note, id) => {
          if (!cloudNotes.has(id)) {
            await createCloudNote(note);
          }
        });
      }
      if (cloudNotes.size > 0) {
        cloudNotes.forEach((note, id) => {
          if (note.archived) {
            localNotes.delete(id);
          } else {          
            localNotes.set(id, note);
          }
        });
        await AsyncStorage.setItem(
          "notes",
          JSON.stringify(Array.from(localNotes.entries())),
          callback(localNotes)
        );
      }
      setNotes(localNotes);
      callback(localNotes);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNote = async (id: string, callback: CallableFunction) => {
    await deleteCloudNote(id);
    await AsyncStorage.setItem(
        "notes",
        JSON.stringify(Array.from(notes.entries())),
    );
    notes.delete(id);
    setNotes(notes);
    callback(notes);
  };

  const createNote = async (callback: Callback) => {
    const newNote = {
      id: ID.unique(),
      title: "Untitled Note",
      content: "",
      created_at: new Date(Date.now()).toISOString(),
      archived: false,
    };

    notes.set(newNote.id, newNote);
    setNotes(notes);
    setCurrentNote(newNote.id);
    await Promise.allSettled([
      createCloudNote(newNote),
      AsyncStorage.setItem(
        "notes",
        JSON.stringify(Array.from(notes.entries())),
        callback
      ),
    ]);
  };

  const updateNote = async (title: string, text: string) => {
    let note = notes.get(currentNote);
    note.title = title;
    note.content = text;
    notes.set(currentNote, note);
    setNotes(notes);
    await Promise.allSettled([
      updateCloudNote(note),
      AsyncStorage.setItem(
        "notes",
        JSON.stringify(Array.from(notes.entries()))
      ),
    ]);
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
