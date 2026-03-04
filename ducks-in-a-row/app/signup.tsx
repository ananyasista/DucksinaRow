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
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { signup, me } from "../api/auth"

export default function SignupScreen() {
  const [firstName, setFirstName] = useState(""); // Optional
  const [lastName, setLastName] = useState(""); // Optional
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    setMsg("");

    if (!firstName.trim()) return setMsg("First name is required.");
    if (!lastName.trim()) return setMsg("Last name is required.");
    if (!email.trim()) return setMsg("Email is required.");
    if (!password) return setMsg("Password is required.");
    if (password.length < 8) return setMsg("Password must be at least 8 characters.");
    if (password !== verifyPassword) return setMsg("Passwords do not match.");

    // Temp to see after use submits
    const payload = {
      email: email.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password,
      join_code: joinCode.trim() || undefined,
    };

    try {
      setLoading(true);

      // CORE LOGIC: Call signup API
      const { token, user } = await signup({
        email: email.trim().toLowerCase(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
        join_code: joinCode.trim() || undefined,
      });

      const profile = await me(token);
      console.log("ME:", profile);

      setMsg(`SUCCESS: Account created for ${user.email}`);

      // router.replace("/(tabs)"); reroute to home 
    } catch (e: any) {
      console.log("SIGNUP ERROR:", e?.response?.data || e.message);

      // show serializer errors nicely
      const data = e?.response?.data;
      if (data) {
        // example: { password: ["This field may not be blank."] }
        const firstKey = Object.keys(data)[0];
        const firstMsg = firstKey ? `${firstKey}: ${String(data[firstKey])}` : "Signup failed.";
        setMsg(firstMsg);
      } else {
        setMsg("Signup failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Link href="/login" asChild>
          <Pressable>
            <Text style={styles.backLink}>← Back to login</Text>
          </Pressable>
        </Link>

        <Text style={styles.h1}>Sign Up</Text>

        <Text style={styles.label}>First Name*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your first name"
          placeholderTextColor="#999"
          autoCapitalize="words"
          value={firstName}
          onChangeText={setFirstName}
        />

        <Text style={styles.label}>Last Name*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#999"
          autoCapitalize="words"
          value={lastName}
          onChangeText={setLastName}
        />

        <Text style={styles.label}>Email Address*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Verify Password*</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter your password"
          placeholderTextColor="#999"
          secureTextEntry
          value={verifyPassword}
          onChangeText={setVerifyPassword}
        />

        <Text style={styles.label}>Group ID (Optional)</Text>
        <Text style={styles.helper}>
          Leave blank to create a new group. Enter a 5-character code to join.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="ABCDE"
          placeholderTextColor="#999"
          autoCapitalize="characters"
          maxLength={5}
          value={joinCode}
          onChangeText={setJoinCode}
        />

        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onSignup} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Create Account</Text>}
        </Pressable>

        {!!msg && <Text style={styles.msg}>{msg}</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}

const PRIMARY = "#0B6B55";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    padding: 18,
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
  backLink: {
    color: PRIMARY,
    fontWeight: "800",
    marginBottom: 2,
  },
  h1: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: "#333",
    fontWeight: "700",
    marginTop: 6,
  },
  helper: {
    fontSize: 12,
    color: "#666",
    marginTop: -6,
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
    marginTop: 10,
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
    fontWeight: "900",
  },
  msg: {
    color: "#333",
    marginTop: 6,
  },
});