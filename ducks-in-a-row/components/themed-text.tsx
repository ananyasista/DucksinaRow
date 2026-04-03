import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

import { useFonts, Cantarell_400Regular, Cantarell_700Bold } from '@expo-google-fonts/cantarell'
import {PTSansCaption_700Bold} from '@expo-google-fonts/pt-sans-caption'
import {Rubik_400Regular, Rubik_300Light} from '@expo-google-fonts/rubik'

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'secondarySubtitle' | 'link' | 'boldText' | 'text' | 'errorText';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {

  const [fontsLoaded] = useFonts({
    Cantarell_400Regular,
    Cantarell_700Bold,
    PTSansCaption_700Bold,
    Rubik_400Regular,
    Rubik_300Light
  });

  return (
    <Text
      style={[
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'secondarySubtitle' ? styles.secondarySubtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'boldText' ? styles.boldText : undefined,
        type === 'text' ? styles.text: undefined,
        type === 'errorText' ? styles.errorText: undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Cantarell_400Regular"
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Cantarell_700Bold'
  },
  title: {
    fontSize: 32,
    fontFamily: "PTSansCaption_700Bold"
    
  },
  subtitle: {
    fontSize: 24,
    fontFamily: 'Rubik_400Regular'
  },
  secondarySubtitle: {
    marginTop: 0,
    fontSize: 20,
    fontFamily: 'Rubik_300Light',
  },
  boldText: {
    fontSize:16,
    fontFamily: 'Cantarell_700Bold'
  },
  text: {
    fontSize: 12,
    fontFamily: 'Cantarell_400Regular'
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    fontFamily: 'Cantarell_700Bold'
  },
  
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
