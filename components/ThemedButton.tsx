import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";

export type ThemedButtonProps = TouchableOpacityProps & {
  lightColor?: string;
  darkColor?: string;
  onPress: () => void;
};

export function ThemedButton({
  style,
  lightColor,
  darkColor,
  onPress,
  ...otherProps
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text"
  );
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor,
          padding: 10,
          borderRadius: 5,
        },
        style,
      ]}
      onPress={onPress}
      {...otherProps}
    >
      <Ionicons
        size={30}
        style={{ margin: "auto" }}
        name="add-sharp"
        color={color}
      />
    </TouchableOpacity>
  );
}
