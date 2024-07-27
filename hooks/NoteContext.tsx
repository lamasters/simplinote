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
  currentNote: string | null;
  setCurrentNote: CallableFunction;
  createNote: CallableFunction;
  readNotes: CallableFunction;
  updateNote: CallableFunction;
  deleteNote: CallableFunction;
};

const StateContext = React.createContext<State>({
  notes: new Map(),
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
  const [encryptedNotes, setEncryptedNotes] = React.useState<Map<string, Note>>(
    new Map()
  );
  const [currentNote, setCurrentNote] = React.useState<string | null>(null);
  const {
    createNote: createCloudNote,
    updateNote: updateCloudNote,
    deleteNote: deleteCloudNote,
    readNotes: readCloudNotes,
    encryptText,
    decryptText,
    session,
  } = useSession();

  const decryptNotes = async (notes: Map<string, Note>) => {
    let decryptedNotes = new Map<string, Note>();
    for (let note of notes.entries()) {
      let id = note[0];
      let noteData = note[1];
      let decryptedNote = {
        id: id,
        title: await decryptText(noteData.title),
        content: await decryptText(noteData.content),
        created_at: noteData.created_at,
        archived: noteData.archived,
      };
      decryptedNotes.set(id, decryptedNote);
    }
    return decryptedNotes;
  };

  const readNotes = async (callback: CallableFunction) => {
    try {
      const results = await Promise.allSettled([
        readCloudNotes(),
        AsyncStorage.getItem(session.$id),
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
      if (localRes.status === "fulfilled" && localRes.value) {
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
          session.$id,
          JSON.stringify(Array.from(localNotes.entries()))
        );
      }
      const decryptedNotes = await decryptNotes(localNotes);
      setEncryptedNotes(localNotes);
      setNotes(decryptedNotes);
      callback(decryptedNotes);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNote = async (id: string, callback: CallableFunction) => {
    notes.delete(id);
    encryptedNotes.delete(id);
    await deleteCloudNote(id);
    await AsyncStorage.setItem(
      session.$id,
      JSON.stringify(Array.from(encryptedNotes.entries()))
    );
    setNotes(notes);
    setEncryptedNotes(encryptedNotes);
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
    const encryptedNote = {
      ...newNote,
      title: await encryptText(newNote.title),
      content: await encryptText(newNote.content),
    };
    notes.set(newNote.id, newNote);
    encryptedNotes.set(newNote.id, encryptedNote);
    setNotes(notes);
    setEncryptedNotes(encryptedNotes);
    setCurrentNote(newNote.id);
    await Promise.allSettled([
      createCloudNote(encryptedNote),
      AsyncStorage.setItem(
        session.$id,
        JSON.stringify(Array.from(encryptedNotes.entries())),
        callback
      ),
    ]);
  };

  const updateNote = async (title: string, content: string) => {
    let note = notes.get(currentNote);
    let encryptedNote = encryptedNotes.get(currentNote);
    note.title = title;
    note.content = content;
    encryptedNote.title = await encryptText(title);
    encryptedNote.content = await encryptText(content);
    notes.set(currentNote, note);
    encryptedNotes.set(currentNote, encryptedNote);
    setNotes(notes);
    setEncryptedNotes(encryptedNotes);
    await Promise.allSettled([
      updateCloudNote(encryptedNote),
      AsyncStorage.setItem(
        session.$id,
        JSON.stringify(Array.from(encryptedNotes.entries()))
      ),
    ]);
  };

  return (
    <StateContext.Provider
      value={{
        notes,
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
