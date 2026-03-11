import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

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
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 400,
  },
  secondarySubtitle: {
    fontSize: 20,
    fontWeight: 400,
  },
  boldText: {
    fontSize:16,
    fontWeight: 600
  },
  text: {
    fontSize: 12,
    fontWeight: 300
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    fontWeight: 300
  },
  
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
