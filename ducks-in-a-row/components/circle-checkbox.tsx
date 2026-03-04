import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
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
            color="#ffffff"
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  checkedCircle: {
    backgroundColor: "green",
  },
});