import { StyleSheet, Text } from "react-native";
import { BlurView } from "expo-blur";
import { TouchableOpacity } from "react-native";
import { View } from "react-native";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";
import { useEffect } from "react";

export type Action = {
  title: string;
  action: CallableFunction;
  color?: string;
};

type Props = {
  actions: Action[];
};

export function ActionSheet(props: Props) {
  const bottom = useSharedValue(-200);

  useEffect(() => {
    (bottom.value = withSpring(0, { mass: 0.5 })), [];
  });

  return (
    <Animated.View
      style={{
        bottom: bottom,
        width: "90%",
        position: "absolute",
        left: "5%",
      }}
    >
      <BlurView intensity={20} style={styles.sheet}>
        {props.actions.map((action, idx) => (
          <View key={idx} style={styles.container}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                bottom.value = withSpring(-200, { duration: 700 });
                setTimeout(() => action.action(), 750);
              }}
            >
              <Text
                style={{
                  color: `${action.color || "#60c0f6"}`,
                  fontSize: 24,
                }}
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
    </Animated.View>
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
    backgroundColor: "rgba(200, 200, 200, 0.4)",
    paddingBottom: 40,
    paddingTop: 15,
    borderRadius: 50,
    overflow: "hidden",
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
