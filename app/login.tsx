import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSession } from "@/hooks/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useSession();
  const router = useRouter();

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");

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
      <TouchableOpacity
        onPress={() =>
          login(email, password, () => {
            router.push("/");
          })
        }
      >
        <ThemedText style={styles.button}>Login</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/signup")}>
        <ThemedText style={styles.button}>Sign Up</ThemedText>
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
    borderRadius: 15,
    borderWidth: 1,
    textAlign: "center",
    marginTop: 10,
  },
});
