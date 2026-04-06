import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { getLivingPreferences, updateLivingPreferences } from "../api/preferences";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedTextInput } from "@/components/text-input";
import { LivingPreferences, me, updateProfile } from "@/api/auth";
import { ThemedText } from "@/components/themed-text";

type ProfileInfo = {
   id?: string;
   email: string;
   first_name: string;
   last_name: string;
   username?: string;
   household_join_code?: string | null;
   display_color?: string | null;
   living_preferences?: LivingPreferences | null;
};

const DEFAULT_PREFS = {
  id: "",
  email: "",
  first_name: "",
  last_name: "",
}

export default function ProfileEdit() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileInfo>(DEFAULT_PREFS);
  const { mode } = useLocalSearchParams<{ mode: string }>();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await me();
        setProfile({
          ...DEFAULT_PREFS,
          ...data
        })
      } catch (err) {
        console.log("FETCH PROFILE ERROR:", err);
        setProfile(DEFAULT_PREFS);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);
  function updateFirstName(input:string) {
    profile.first_name = input.trim();
  }
   function updateLastName(input:string) {
    profile.last_name = input.trim();
  }
   function updateEmail(input:string) {
    profile.email = input.trim().toLowerCase();
  }

  const validate = () => {
    if(profile?.first_name === "") 
    {
       return "First name is a required field"
    }
    if(profile?.last_name === "") 
    {
       return "Last name is a required field"
    }
    if(profile?.email === "") 
    {
       return "Email is a required field"
    }
    return "";
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Invalid Input", err);
      return;
    }

    try {
      setSaving(true);
      

      const payload: ProfileInfo = {
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
      }
      const updated = await updateProfile(payload);
      setProfile({...DEFAULT_PREFS, ...updated});

    // Living Preference Survey
    if (mode === "edit") {
        router.replace("/profile");
    } else {
        router.replace("/(tabs)");
    }
    } catch (err: any) {
      console.log("SAVE ERROR:", err?.response?.data || err?.message || err);
      Alert.alert("Error", "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <SafeAreaView>
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <ThemedText type="title">Profile Settings</ThemedText>
      <EditTextField
        question="First Name:"
        value={profile?.first_name ?? null}
        onChange={updateFirstName}
      />
      <EditTextField
        question="Last Name:"
        value={profile?.last_name ?? null}
        onChange={updateLastName}
      />
      <EditTextField
        question="Email:"
        value={profile?.email ?? null}
        onChange={updateEmail}
      />
      <Pressable
        style={[styles.button, saving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <ThemedText style={styles.buttonText}>
          {saving ? "Saving..." : "Save Preferences"}
        </ThemedText>
      </Pressable>
    </ScrollView>
    </SafeAreaView>
  );
}

function EditTextField({
  question,
  value,
  onChange,
}: {
  question: string;
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.questionBlock}>
      <ThemedText type='boldText'>{question}</ThemedText>
      <View>
        <ThemedTextInput onChangeText={onChange} defaultValue={value === null ? undefined : value}/>
      </View>
    </View>
  );
}


const PRIMARY = "#0B6B55";

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F2F2F2",
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "#666",
    marginBottom: 16,
  },
  questionBlock: {
    marginBottom: 18,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  label: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 10,
    color: "#111",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,  
    borderWidth: 3,
    borderColor: '#a51515'
  },
  choiceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    
    borderWidth: 3,
    borderColor: '#15a583'
  },
  button: {
    marginTop: 8,
    backgroundColor: PRIMARY,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },
  backButton: {
  marginBottom: 10,
  },

  backText: {
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 14,
  },
});