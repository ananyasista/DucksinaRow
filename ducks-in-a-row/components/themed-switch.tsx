import React, {useState, useEffect} from 'react';
import {Switch, StyleSheet, View} from 'react-native';
import { ThemedText } from './themed-text';
type ThemedSwitchProps = {
    label:string;
    value: boolean;
    onChangeSwitch: (set: boolean)=> void;
};
export function ThemedSwitch({label="", onChangeSwitch, value=false}:ThemedSwitchProps) {
  const [isEnabled, setIsEnabled] = useState(value);

  // Sync isEnabled with value prop changes
  useEffect(() => {
    setIsEnabled(value);
  }, [value]);

  function toggleSwitch() {
      onChangeSwitch(!isEnabled);
      setIsEnabled(!isEnabled);
  }

  return (
    <View style={styles.toggleRow}>
        <ThemedText type='boldText'>{label}</ThemedText>
        <Switch
                trackColor={{false: '#f4f4f3', true: '#FAAE43'}}
                thumbColor={isEnabled ? '#f4f4f3': '#FAAE43'}
                ios_backgroundColor="#f4f4f3"
                onValueChange={toggleSwitch}
                value={isEnabled}
                onTouchStart={(e) => e.stopPropagation()}
        />
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    justifyContent:"space-between",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingTop:12
  }
});
