import { PropsWithChildren } from 'react';
import {StyleSheet, TextInput} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

type ThemedTextInputProps = PropsWithChildren<{
    onChangeText: (text:string) => void;
    size?: 'small' | 'large';
    multiline?: boolean,
    placeholder?: string,
    defaultValue?: string,
}>;

export function ThemedTextInput({onChangeText, size='small', multiline = false, placeholder= "", defaultValue =""}: ThemedTextInputProps) {

  return (
    <TextInput
        onChangeText={onChangeText}
        style={[
            styles.textInput,
            size === 'small' ? styles.small : undefined,
            size === 'large' ? styles.large : undefined
        ]}
        multiline = {multiline}
        placeholder= {placeholder}
        placeholderTextColor = 'rgba(171, 164, 164, 0.58)'
        defaultValue={defaultValue}
    /> 
  );
}

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    marginTop: 10, 
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    borderColor: '#ABA4A461',
    backgroundColor: '#F6F4F4C4',
  },
  small: {
    height: 40,
  },
  large: {
    height:102,
  }
});
