import * as SecureStore from "expo-secure-store";

import {
  Account,
  Client,
  Databases,
  ID,
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
import {
  createAccountKey,
  createDeviceKeys,
  decryptKey,
  decryptString,
  encryptKey,
  encryptString,
  hash,
} from "@/hooks/encryption";

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
  encryptText: CallableFunction;
  decryptText: CallableFunction;
};

const AuthContext = createContext<Auth>({
  session: null,
  login: () => null,
  loading: true,
  createNote: () => null,
  updateNote: () => null,
  deleteNote: () => null,
  readNotes: () => null,
  encryptText: () => null,
  decryptText: () => null,
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
  const [accountKey, setAccountKey] = useState<string | null>(null);

  const getDeviceKey = async (keyName: string) => {
    let key = JSON.parse(await SecureStore.getItemAsync(keyName));
    if (key) {
      return key;
    }
    return null;
  };

  const registerDevice = async () => {
    console.log("Creating new device keys");
    const keyPair = await createDeviceKeys();
    console.log("Keys created");
    let deviceId = await hash(keyPair.public);
    console.log("Device ID: ", deviceId);
    const devices = await database.listDocuments(
      APPWRITE_CONFIG.DATABASE,
      APPWRITE_CONFIG.DEVICES
    );
    console.log("Devices: ", devices);
    console.log("Session ID: ", session.$id);
    let sessionInfo;
    try {
      let sessions = await account.listSessions();
      let currentSession = sessions.sessions.find((s) => s.current);
      sessionInfo = await account.getSession(currentSession.$id);
    } catch (e) {
      console.error(e);
    }
    console.log("Session info: ", sessionInfo);
    let deviceDocument = {
      name: `${sessionInfo.deviceBrand} ${sessionInfo.deviceModel} ${sessionInfo.osName}`,
      device_key: keyPair.public,
      key_hash: deviceId,
    };
    console.log("Device document: ", deviceDocument);
    console.log("Device key length: ", keyPair.public.length);
    if (devices.documents.length === 0) {
      console.log("Creating new account key");
      let newAccountKey = await createAccountKey();
      console.log("Encrypting account key");
      let encryptedKey = await encryptKey(keyPair.public, newAccountKey);
      console.log("Storing account key");
      await SecureStore.setItemAsync(
        "accountKey",
        JSON.stringify(newAccountKey)
      );
      console.log("Setting account key on database document");
      deviceDocument["account_key"] = encryptedKey;
      console.log("Account key length: ", encryptedKey.length);
    }
    console.log("Creating device document");
    try {
      await database.createDocument(
        APPWRITE_CONFIG.DATABASE,
        APPWRITE_CONFIG.DEVICES,
        ID.unique(),
        deviceDocument,
        [
          Permission.read(Role.user(session.$id)),
          Permission.write(Role.user(session.$id)),
          Permission.update(Role.user(session.$id)),
          Permission.delete(Role.user(session.$id)),
        ]
      );
      console.log("Uploaded device document", deviceDocument);
      await SecureStore.setItemAsync(
        "publicKey",
        JSON.stringify(keyPair.public)
      );
      await SecureStore.setItemAsync(
        "privateKey",
        JSON.stringify(keyPair.private)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const getKeys = async () => {
    let storedPublicKey = await getDeviceKey("publicKey");
    let storedPrivateKey = await getDeviceKey("privateKey");
    if (!storedPublicKey || !storedPrivateKey) {
      console.log("New device! Registering...");
      await registerDevice();
    } else {
      console.log("Existing device! Getting keys...");
    }
    let accountKey = JSON.parse(await SecureStore.getItemAsync("accountKey"));
    console.log("Got account key result");
    if (accountKey) {
      console.log("Importing account key");
      setAccountKey(accountKey);
    } else {
      console.log("No account key found");
      const deviceId = await hash(storedPublicKey);
      const device = await database.getDocument(
        APPWRITE_CONFIG.DATABASE,
        APPWRITE_CONFIG.DEVICES,
        deviceId
      );
      let decryptedAccountKey = await decryptKey(
        storedPrivateKey,
        device["account_key"]
      );
      await SecureStore.setItemAsync(
        "accountKey",
        JSON.stringify(decryptedAccountKey)
      );
      setAccountKey(decryptedAccountKey);
    }
  };

  const [session, setSession] =
    useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  const getSession = async () => {
    setLoading(true);
    if (session) {
      console.log("Existing session");
      if (!accountKey) {
        console.log("Getting keys for session ", session.$id);
        await getKeys();
        console.log("Got keys");
      } else {
        console.log("Already have keys");
      }
      setLoading(false);
      return session;
    }
    let newSession = null;
    try {
      newSession = await account.get();
    } catch (e) {
      console.warn(e);
    }
    if (newSession) {
      setSession(newSession);
    }
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
  }, [session]);

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
        encryptText: (text: string) => encryptString(text, accountKey),
        decryptText: (text: string) => decryptString(text, accountKey),
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
