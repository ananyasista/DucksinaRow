/* 
- App title
- app subtitle
- Login title
- username entry
- password entry
- forgot password link
- login button
- account signup at bottom


*/
import React from 'react';
import { Image } from 'expo-image';
import { Platform, StyleSheet, TextInput } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { Link } from 'expo-router';

export default function LoginScreen() {
    const [text, onChangeText] = React.useState('Useless Text');
 return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
        <ThemedView style={styles.loginContainer}>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Login</ThemedText>
            </ThemedView>
            <TextInput 
                style = {styles.input}
                placeholder="email@email.com"
                onChangeText= {onChangeText}
                value = {text}
            />
        </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
    input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  loginContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  }

});