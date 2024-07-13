import { StyleSheet, Text, View } from "react-native";

export function Divider() {
  return <View style={styles.divider}></View>;
}

const styles = StyleSheet.create({
  divider: {
    position: "relative",
    width: "100%",
    height: 1,
    backgroundColor: "#999",
    marginTop: 5,
    marginBottom: 5,
  },
});
