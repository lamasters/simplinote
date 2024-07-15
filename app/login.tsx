import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { useSession } from "@/hooks/AuthContext";
import { Client, Account, ID } from "react-native-appwrite";
import { useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";

export default function Index() {
  const client = new Client();
  client
    .setEndpoint("https://homelab.hippogriff-lime.ts.net/v1")
    .setProject("6693316c000be6973e37")
    .setPlatform("com.lamasters.simplinote");

  const account = new Account(client);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setSession } = useSession();
  const router = useRouter();

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
    } catch (e) {
      console.warn(e);
    }
    try {
      let newSession = await account.get();
      setSession(newSession);
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText>Email</ThemedText>
      <TextInput
        style={{ ...styles.textEntry, color: textColor }}
        onChangeText={(text) => setEmail(text)}
        value={email}
        placeholder="you@example.com"
        placeholderTextColor={placeholderColor}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <ThemedText>Password</ThemedText>
      <TextInput
        style={{ ...styles.textEntry, color: textColor }}
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry={true}
        autoCapitalize="none"
        autoComplete="off"
      />
      <TouchableOpacity onPress={() => login(email, password)}>
        <ThemedText style={styles.button}>Login</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textEntry: {
    height: 40,
    width: "80%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 25,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
    marginTop: 5,
    marginBottom: 10,
  },
  button: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
    borderColor: "gray",
    borderRadius: 25,
    borderWidth: 1,
    textAlign: "center",
    marginTop: 10,
  },
});
