import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { IconSymbol } from './ui/icon-symbol';

type Props = {
  checked: boolean;
  onToggle: () => void;
  size?: number;
};

export default function CircularCheckbox({
  checked,
  onToggle,
  size = 32,
}: Props) {
  return (
    <Pressable onPress={onToggle}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2
          },
          checked && styles.checkedCircle,
        ]}
      >
        {checked && (
          <IconSymbol
            size={size * 0.6}
            name="checkmark"
            color="#eaf3ec"
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    borderColor: "#233426",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fffffffa",
  },

  checkedCircle: {
    backgroundColor: "#5B6D5E",
  },
});