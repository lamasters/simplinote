import React from "react";
import { Models } from "react-native-appwrite";

export type Auth = {
  session: Models.User<Models.Preferences> | null;
  setSession: CallableFunction;
};

const AuthContext = React.createContext<Auth>({
  session: null,
  setSession: () => null,
});

export function useSession() {
  const value = React.useContext(AuthContext);
  if (!value) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return value;
}

export function AuthProvider(props: React.PropsWithChildren<{}>) {
  const [session, setSession] =
    React.useState<Models.User<Models.Preferences> | null>(null);
  return (
    <AuthContext.Provider value={{ session: session, setSession: setSession }}>
      {props.children}
    </AuthContext.Provider>
  );
}
