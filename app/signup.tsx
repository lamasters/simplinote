import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSession } from "@/hooks/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [goodPassword, setGoodPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(
    "Password must be at least 8 characters"
  );
  const { signup } = useSession();
  const router = useRouter();

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");

  const testPassword = (password: string, confirmPassword: string) => {
    if (password.length < 8) {
      setGoodPassword(false);
      setPasswordMessage("Password must be at least 8 characters");
    } else if (password !== confirmPassword) {
      setGoodPassword(false);
      setPasswordMessage("Passwords don't match");
    } else {
      setGoodPassword(true);
      setPasswordMessage("Passwords match");
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
        onChangeText={(text) => {
          setPassword(text);
          testPassword(text, confirmPassword);
        }}
        value={password}
        secureTextEntry={true}
        autoCapitalize="none"
        autoComplete="off"
      />
      <ThemedText>Confirm Password</ThemedText>
      <TextInput
        style={{ ...styles.textEntry, color: textColor }}
        onChangeText={(text) => {
          setConfirmPassword(text);
          testPassword(password, text);
        }}
        value={confirmPassword}
        secureTextEntry={true}
        autoCapitalize="none"
        autoComplete="off"
      />
      <View style={styles.passwordCheck}>
        <Ionicons
          name={goodPassword ? "checkmark" : "close"}
          size={24}
          color={goodPassword ? "green" : "red"}
        />
        <ThemedText style={{ marginLeft: 10 }}>{passwordMessage}</ThemedText>
      </View>
      <TouchableOpacity
        onPress={() =>
          signup(email, password, confirmPassword, () => {
            router.push("/");
          })
        }
      >
        <ThemedText style={styles.button}>Create Account</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/login")}>
        <ThemedText style={styles.button}>Back to Login</ThemedText>
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
  passwordCheck: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
