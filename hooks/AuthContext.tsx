import * as SecureStore from "expo-secure-store";

import {
  Account,
  Client,
  Databases,
  ID,
  Permission,
  Query,
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

export type Device = {
  id: string;
  name: string;
  device_key: string;
  key_hash: string;
  account_key?: string;
};

export type Auth = {
  session: Models.User<Models.Preferences> | null;
  login: CallableFunction;
  signup: CallableFunction;
  loading: boolean;
  createNote: CallableFunction;
  updateNote: CallableFunction;
  deleteNote: CallableFunction;
  readNotes: CallableFunction;
  encryptText: CallableFunction;
  decryptText: CallableFunction;
  setDeviceAccountKey: CallableFunction;
  removeDevice: CallableFunction;
  accountKey: string | null;
  newDevices: Array<Device>;
};

const AuthContext = createContext<Auth>({
  session: null,
  login: () => null,
  signup: () => null,
  loading: true,
  createNote: () => null,
  updateNote: () => null,
  deleteNote: () => null,
  readNotes: () => null,
  encryptText: () => null,
  decryptText: () => null,
  setDeviceAccountKey: () => null,
  removeDevice: () => null,
  accountKey: null,
  newDevices: [],
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
  const [newDevices, setNewDevices] = useState<Array<Device>>([]);

  const getDeviceKey = async (keyName: string) => {
    let key = JSON.parse(await SecureStore.getItemAsync(keyName));
    if (key) {
      return key;
    }
    return null;
  };

  const registerDevice = async () => {
    const keyPair = await createDeviceKeys();
    let deviceId = await hash(keyPair.public);
    const devices = await database.listDocuments(
      APPWRITE_CONFIG.DATABASE,
      APPWRITE_CONFIG.DEVICES
    );
    let sessionInfo;
    try {
      let sessions = await account.listSessions();
      let currentSession = sessions.sessions.find((s) => s.current);
      sessionInfo = await account.getSession(currentSession.$id);
    } catch (e) {
      console.error(e);
    }
    let deviceDocument = {
      name: `${sessionInfo.deviceBrand} ${sessionInfo.deviceModel} ${sessionInfo.osName}`,
      device_key: keyPair.public,
      key_hash: deviceId,
    };
    if (devices.documents.length === 0) {
      let newAccountKey = await createAccountKey();
      let encryptedKey = await encryptKey(keyPair.public, newAccountKey);
      await SecureStore.setItemAsync(
        "accountKey",
        JSON.stringify(newAccountKey)
      );
      deviceDocument["account_key"] = encryptedKey;
    }
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

  const checkNewDevices = async () => {
    const devices = await database.listDocuments(
      APPWRITE_CONFIG.DATABASE,
      APPWRITE_CONFIG.DEVICES,
      [Query.isNull("account_key")]
    );

    if (devices.total > 0) {
      let newDeviceList = [];
      devices.documents.forEach((device) => {
        newDeviceList.push({
          id: device.$id,
          name: device.name,
          device_key: device.device_key,
          key_hash: device.key_hash,
        });
      });
      setNewDevices(newDeviceList);
    }
  };

  const setDeviceAccountKey = async (device: Device) => {
    const encryptedAccountKey = await encryptKey(device.device_key, accountKey);
    await database.updateDocument(
      APPWRITE_CONFIG.DATABASE,
      APPWRITE_CONFIG.DEVICES,
      device.id,
      {
        account_key: encryptedAccountKey,
      }
    );
    setNewDevices(newDevices.filter((d) => d.id !== device.id));
  };

  const removeDevice = async (device: Device) => {
    await database.deleteDocument(
      APPWRITE_CONFIG.DATABASE,
      APPWRITE_CONFIG.DEVICES,
      device.id
    );
    setNewDevices(newDevices.filter((d) => d.id !== device.id));
  };

  const getKeys = async () => {
    let storedPublicKey = await getDeviceKey("publicKey");
    let storedPrivateKey = await getDeviceKey("privateKey");
    if (!storedPublicKey || !storedPrivateKey) {
      await registerDevice();
    } else {
    }
    let accountKey = JSON.parse(await SecureStore.getItemAsync("accountKey"));
    if (accountKey) {
      setAccountKey(accountKey);
      await checkNewDevices();
    } else {
      const deviceId = await hash(storedPublicKey);
      const devices = await database.listDocuments(
        APPWRITE_CONFIG.DATABASE,
        APPWRITE_CONFIG.DEVICES,
        [Query.equal("key_hash", deviceId)]
      );
      if (devices.total == 1 && devices.documents[0]["account_key"]) {
        let decryptedAccountKey = await decryptKey(
          storedPrivateKey,
          devices.documents[0]["account_key"]
        );
        await SecureStore.setItemAsync(
          "accountKey",
          JSON.stringify(decryptedAccountKey)
        );
        setAccountKey(decryptedAccountKey);
        await checkNewDevices();
      }
    }
  };

  const [session, setSession] =
    useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  const getSession = async () => {
    setLoading(true);
    if (session) {
      if (!accountKey) {
        await getKeys();
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

  const signup = async (
    email: string,
    password: string,
    confirmPassword: string,
    callback: CallableFunction
  ) => {
    if (password !== confirmPassword) {
      return;
    }
    try {
      const name = email.split("@")[0];
      await account.create(ID.unique(), email, password, name);
    } catch (e) {
      console.warn(e);
    }

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
        signup: signup,
        loading: loading,
        createNote: createNote,
        updateNote: updateNote,
        deleteNote: deleteNote,
        readNotes: readNotes,
        encryptText: (text: string) => encryptString(text, accountKey),
        decryptText: (text: string) => decryptString(text, accountKey),
        setDeviceAccountKey: setDeviceAccountKey,
        removeDevice: removeDevice,
        accountKey: accountKey,
        newDevices: newDevices,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
