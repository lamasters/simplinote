import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

import { useSession } from "@/hooks/AuthContext";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
  const { newDevices, setDeviceAccountKey, removeDevice } = useSession();
  const router = useRouter();
  if (newDevices.length === 0) {
    router.back();
  }
  const device = newDevices[0] || null;

  const allowDevice = async () => {
    await setDeviceAccountKey(device);
  };

  const denyDevice = async () => {
    await removeDevice(device);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText>
        Allow new device "{device ? device.name : ""}" to connect?
      </ThemedText>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => allowDevice()}>
          <Ionicons name="checkmark" size={24} color="green" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => denyDevice()}>
          <Ionicons name="close" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    width: 80,
    backgroundColor: "rgba(100, 100, 100, 0.4)",
    alignItems: "center",
  },
});
