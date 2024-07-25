import { StyleSheet, Text } from "react-native";
import { BlurView } from "expo-blur";
import { TouchableOpacity } from "react-native";
import { View } from "react-native";

export type Action = {
  title: string;
  action: CallableFunction;
  color?: string;
};

type Props = {
  actions: Action[];
};

export function ActionSheet(props: Props) {
  return (
    <BlurView intensity={50} style={styles.sheet}>
      {props.actions.map((action, idx) => (
        <View key={idx} style={styles.container}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              action.action();
            }}
          >
            <Text
              style={{ color: `${action.color || "#60c0f6"}`, fontSize: 24 }}
            >
              {action.title}
            </Text>
          </TouchableOpacity>
          {idx < props.actions.length - 1 ? (
            <View style={styles.divider} />
          ) : null}
        </View>
      ))}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  sheet: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(200, 200, 200, 0.7)",
    paddingBottom: 40,
    paddingTop: 15,
    borderRadius: 25,
  },
  container: {
    width: "100%",
  },
  actionButton: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(250, 250, 250, 0.3)",
  },
});
