import React, {useState, useEffect} from 'react';
import {Switch, StyleSheet, View} from 'react-native';
import { ThemedText } from './themed-text';
type ThemedSwitchProps = {
    label:string;
    value: boolean;
    onChangeSwitch: (set: boolean)=> void;
    editable?: boolean;
    labelType?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'secondarySubtitle' | 'link' | 'boldText' | 'text' | 'errorText';
};
export function ThemedSwitch({label="", onChangeSwitch, value=false, editable=true, labelType}:ThemedSwitchProps) {
  const [isEnabled, setIsEnabled] = useState(value);

  // Sync isEnabled with value prop changes
  useEffect(() => {
    setIsEnabled(value);
  }, [value]);

  function toggleSwitch() {
    if(editable)
    {
      onChangeSwitch(!isEnabled);
      setIsEnabled(prev => !prev);
    }
  }

  return (
    <View style={styles.toggleRow}>
        <ThemedText type={labelType}>{label}</ThemedText>
        <Switch
                trackColor={{false: '#bcbcbb', true: '#EC8534'}}
                thumbColor={!isEnabled ? '#f4f4f3': '#f4f4f3'}
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
