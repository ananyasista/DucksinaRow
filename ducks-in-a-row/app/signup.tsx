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
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { signup, me } from "../api/auth"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/themed-text";
import { createHousehold } from "@/api/household";

export default function SignupScreen() {
  const [firstName, setFirstName] = useState(""); // Optional
  const [lastName, setLastName] = useState(""); // Optional
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [houseName, setHouseName] = useState("");

  const [joinHouse, setJoinHouse] = useState(true);
  
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    setMsg("");

    if (!firstName.trim()) return Alert.alert("First name is required.");
    if (!lastName.trim()) return Alert.alert("Last name is required.");
    if (!email.trim()) return Alert.alert("Email is required.");
    if (!password) return Alert.alert("Password is required.");
    if (password.length < 8) return Alert.alert("Password must be at least 8 characters.");
    if (password !== verifyPassword) return Alert.alert("Passwords do not match.");
    if (!joinHouse && houseName === "") return Alert.alert("House name for new groups is required.");
    if (joinHouse && joinCode === "") return Alert.alert("Household code is required.");

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
      if(!joinHouse){setJoinCode("");}
      // CORE LOGIC: Call signup API
      const { token, user } = await signup({
        email: email.trim().toLowerCase(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
        join_code: joinCode.trim() || undefined,
      });

      // Stores user's token in AsyncStorage
      await AsyncStorage.setItem("accessToken", token);

      const profile = await me();
      console.log("ME:", profile);
      handleCreateHousehold();

      setMsg(`SUCCESS: Account created for ${user.email}`);

      // If user joined an existing household or created a new one
      router.push('/living-preferences?mode=onboarding');

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

  const handleCreateHousehold = async () => {
      if (!houseName.trim()) {
        Alert.alert("Missing name", "Please enter a household name.");
        return;
      }
  
      try {
        setLoading(true);
  
        await createHousehold(houseName.trim());
  
        router.replace("/living-preferences?mode=onboarding");
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Could not create household.");
      } finally {
        setLoading(false);
      }
    };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Pressable onPress={() => router.back()}>
            <ThemedText style={styles.backLink}>← Back to login</ThemedText>
          </Pressable>
      <ScrollView contentContainerStyle={styles.scroll}>  
      <View style={styles.card}>
          
        
        <ThemedText type='title'>Sign Up</ThemedText>
      
        <ThemedText type='boldText'>First Name*</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Enter your first name"
          placeholderTextColor="#999"
          autoCapitalize="words"
          value={firstName}
          onChangeText={setFirstName}
        />

        <ThemedText type='boldText'>Last Name*</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#999"
          autoCapitalize="words"
          value={lastName}
          onChangeText={setLastName}
        />

        <ThemedText type='boldText'>Email Address*</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <ThemedText type='boldText'>Password*</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <ThemedText type='boldText'>Verify Password*</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Re-enter your password"
          placeholderTextColor="#999"
          secureTextEntry
          value={verifyPassword}
          onChangeText={setVerifyPassword}
        />

        <BooleanQuestion
          question="Joining an existing house?"
          additionalText = "Select No to create a new group, Select Yes to join an existing group"
          value={joinHouse}
          onSelect={(value) => setJoinHouse(value)}
        />
        {!joinHouse && 
        <View>
          <ThemedText type='boldText'>Name Your New Household*</ThemedText>
          <TextInput
            style={styles.input}
            placeholderTextColor="#999"
            autoCapitalize="characters"
            value={houseName}
            placeholder="Choose Your House Name"
            onChangeText={setHouseName}
          />
          </View>

        }
        {joinHouse && 
        <View>
          <ThemedText type='boldText'>Group ID*</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="ABCDE"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            maxLength={5}
            value={joinCode}
            onChangeText={setJoinCode}
          />
          </View>
        }
        

        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onSignup} disabled={loading}>
          {loading ? <ActivityIndicator /> : <ThemedText style={styles.buttonText}>Create Account</ThemedText>}
        </Pressable>

        {!!msg && <ThemedText style={styles.msg}>{msg}</ThemedText>}
      </View>
              </ScrollView>

    </KeyboardAvoidingView>
  );
}

function BooleanQuestion({
  question,
  additionalText,
  value,
  onSelect,
}: {
  question: string;
  additionalText: string;
  value: boolean;
  onSelect: (value: boolean) => void;
}) {
  return (
     <View>
           <ThemedText type="boldText">{question}</ThemedText>
           <ThemedText  style={styles.label}>{additionalText}</ThemedText>
           <View style={styles.choiceContainer}>
             {["Yes", "No"].map((option) => {
               const boolValue = option === "Yes";
               const selected = value === boolValue;
     
               return (
                 <Pressable
                   key={option}
                   style={[styles.choiceChip, selected && styles.selectedChip]}
                   onPress={() => onSelect(boolValue)}
                 >
                   <ThemedText style={[styles.chipText, selected && styles.selectedChipText]}>
                     {option}
                   </ThemedText>
                 </Pressable>
               );
             })}
           </View>
         </View>
  );
}

const PRIMARY = "#0B6B55";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    padding: 18,
    marginTop: 100,
    marginBottom: 100,
  },
  questionBlock: {
    marginBottom: 18,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
   choiceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  scaleChip: {
    minWidth: 48,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    backgroundColor: "#FAFAFA",
    alignItems: "center",
  },
  choiceChip: {
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "#D9D9D9",
  backgroundColor: "#FAFAFA",
},
  selectedChip: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  chipText: {
    color: "#222",
    fontWeight: "600",
  },
  selectedChipText: {
    color: "#fff",
  },
  scroll: {
    gap: 10,
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
    marginBottom: 20,
    marginTop: -20
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