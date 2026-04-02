import React, {useState} from 'react';
import {Switch, StyleSheet, View} from 'react-native';
import { ThemedText } from './themed-text';
type ThemedSwitchProps = {
    label:string;
    value: boolean;
    onChangeSwitch: (set: boolean)=> void;
    editable?: boolean;
};
export function ThemedSwitch({label="", onChangeSwitch, value=false, editable=true}:ThemedSwitchProps) {
  const [isEnabled, setIsEnabled] = useState(value);
  function toggleSwitch() {
    if(editable)
    {
      onChangeSwitch(!isEnabled);
      setIsEnabled(prev => !prev);
    }
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
