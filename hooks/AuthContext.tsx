import {
  Account,
  Client,
  Databases,
  Permission,
  Role,
} from "react-native-appwrite";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { APPWRITE_CONFIG } from "@/constants/Appwrite";
import { Models } from "react-native-appwrite";
import { Note } from "./NoteContext";

export type Auth = {
  session: Models.User<Models.Preferences> | null;
  login: CallableFunction;
  loading: boolean;
  createNote: CallableFunction;
  updateNote: CallableFunction;
  deleteNote: CallableFunction;
  readNotes: CallableFunction;
};

const AuthContext = createContext<Auth>({
  session: null,
  login: () => null,
  loading: true,
  createNote: () => null,
  updateNote: () => null,
  deleteNote: () => null,
  readNotes: () => null,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return value;
}

export function AuthProvider(props: PropsWithChildren<{}>) {
  const client = new Client();
  client
    .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
    .setProject(APPWRITE_CONFIG.PROJECT)
    .setPlatform(APPWRITE_CONFIG.PLATFORM);
  const account = new Account(client);
  const database = new Databases(client);

  const [session, setSession] =
    useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  const getSession = async () => {
    setLoading(true);
    if (session) {
      setLoading(false);
      return session;
    }
    let newSession = null;
    try {
      newSession = await account.get();
    } catch(e) {
      console.warn(e);
    }
    if (newSession) {
      setSession(newSession);
    }
    setLoading(false);
    return newSession;
  };

  const login = async (
    email: string,
    password: string,
    callback: CallableFunction
  ) => {
    try {
      await account.createEmailPasswordSession(email, password);
    } catch (e) {
      console.warn(e);
    }
    try {
      let newSession = await account.get();
      setSession(newSession);
      callback();
    } catch (e) {
      console.error(e);
    }
  };

  const createNote = async (note: Note) => {
    return database.createDocument(
      APPWRITE_CONFIG.DATABASE,
      APPWRITE_CONFIG.NOTES,
      note.id,
      {
        title: note.title,
        content: note.content,
        created_at: new Date(Date.now()).toISOString(),
        archived: false,
      },
      [
        Permission.read(Role.user(session.$id)),
        Permission.write(Role.user(session.$id)),
        Permission.update(Role.user(session.$id)),
        Permission.delete(Role.user(session.$id)),
      ]
    );
  };

  const updateNote = async (note: Note) => {
    return database.updateDocument(
      APPWRITE_CONFIG.DATABASE,
      APPWRITE_CONFIG.NOTES,
      note.id,
      {
        title: note.title,
        content: note.content,
      }
    );
  };

  const deleteNote = async (note: string) => {
    return database.updateDocument(
      APPWRITE_CONFIG.DATABASE,
      APPWRITE_CONFIG.NOTES,
      note,
      {
        archived: true,
      }
    );
  };

  const readNotes = async () => {
    return database.listDocuments(
      APPWRITE_CONFIG.DATABASE,
      APPWRITE_CONFIG.NOTES
    );
  };

  useEffect(() => {
    getSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session: session,
        login: login,
        loading: loading,
        createNote: createNote,
        updateNote: updateNote,
        deleteNote: deleteNote,
        readNotes: readNotes,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
