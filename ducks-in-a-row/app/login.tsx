import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { Image } from 'react-native';
import { Link, router } from "expo-router";
import { login } from "../api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/themed-text";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setMsg("");

    // client-side validation
    if (!email.trim()) return setMsg("Email is required.");
    if (!password) return setMsg("Password is required.");

    try {
      setLoading(true);

      const { token, user } = await login({
        email: email.trim().toLowerCase(),
        password,
      });
      console.log("LOGIN OK user:", user); // verify token works
      setMsg(`Logged in as ${user.email}`);

      // Store user's token 
      await AsyncStorage.setItem("accessToken", token);

      router.replace("/(tabs)");
    } catch (e: any) {

      // show DRF error if present
      const detail = e?.response?.data?.detail;
      setMsg(detail ? String(detail) : "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
        <ImageBackground
            source={require('@/assets/images/blueBackgroundTwo.png')}
            style={styles.heroBackground}
            imageStyle={styles.heroBackgroundImage}
            resizeMode="cover"
          ></ImageBackground>
      <Image
          source={require('@/assets/images/ducksLogo.png')}
          style={styles.heroLogo}
          resizeMode="contain"
        />
      <View style={styles.card}>
         
        <ThemedText type='title'>Ducks in a Row</ThemedText>
        <ThemedText style={styles.subtitle}>Your roommate management app</ThemedText>

        <ThemedText type='subtitle'>Login</ThemedText>

        <ThemedText type='boldText'>Email</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.rowBetween}>
          <ThemedText  type='boldText' >Password</ThemedText>
          <Pressable onPress={() => setMsg("Forgot password not implemented yet.")}>
            <ThemedText style={styles.linkSmall}>Forgot Password?</ThemedText>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onLogin} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Login</Text>}
        </Pressable>

        {!!msg && <Text style={styles.msg}>{msg}</Text>}

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.bottomRow}>
          <ThemedText style={styles.bottomText}>Don’t have an account? </ThemedText>
          <Link href="/signup" asChild>
            <Pressable>
              <ThemedText style={styles.link}>Sign up!</ThemedText>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const PRIMARY = "#0B6B55"; 

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 18,
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
    
  },
  heroBackgroundImage: {
    width: '100%',
    height: '100%',
    zIndex: 0
  },
   heroLogo: {
    width: 250,
    height: 125,
    alignSelf: 'center',

  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  brand: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    marginTop: 4,
  },
  subtitle: {
    color: "#666",
    marginBottom: 6,
  },
  h1: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
    marginTop: 6,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FAFAFA",
    color: "#111",
  },
  button: {
    marginTop: 8,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },
  msg: {
    color: "#333",
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E6E6E6",
  },
  dividerText: {
    color: "#777",
    fontSize: 12,
  },
  socialRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  socialBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  socialText: {
    fontWeight: "700",
    color: "#222",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  bottomText: {
    color: "#444",
  },
  link: {
    color: PRIMARY,
    fontWeight: "800",
  },
  linkSmall: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "700",
  },
});