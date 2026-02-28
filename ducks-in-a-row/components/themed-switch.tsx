import React, {useState} from 'react';
import {Switch, StyleSheet, View} from 'react-native';
import { ThemedText } from './themed-text';
type ThemedSwitchProps = {
    label:string
};
export function ThemedSwitch({label=""}:ThemedSwitchProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View style={styles.toggleRow}>
        <ThemedText type='boldText'>{label}</ThemedText>
        <Switch
                trackColor={{false: '#767577', true: 'rgba(255, 118, 72, 1)'}}
                thumbColor={isEnabled ? 'rgba(255, 118, 72, 1)' : '#f4f4f3'}
                ios_backgroundColor="#3e3e3e"
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
