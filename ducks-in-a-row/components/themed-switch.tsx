import React, {useState} from 'react';
import {Switch, StyleSheet, View} from 'react-native';
import { ThemedText } from './themed-text';
type ThemedSwitchProps = {
    label:string;
    onChangeSwitch: (set: boolean)=> void;
};
export function ThemedSwitch({label="", onChangeSwitch}:ThemedSwitchProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  function toggleSwitch() 
  {
      onChangeSwitch(!isEnabled);
      setIsEnabled(!isEnabled);
  }

  return (
    <View style={styles.toggleRow}>
        <ThemedText type='boldText'>{label}</ThemedText>
        <Switch
                trackColor={{false: '#f4f4f3', true: 'rgba(255, 118, 72, 1)'}}
                thumbColor={isEnabled ? '#f4f4f3': 'rgba(255, 118, 72, 1)'}
                ios_backgroundColor="#f4f4f3"
                onValueChange={toggleSwitch}
                value={isEnabled}
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
