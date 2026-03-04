import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Switch,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { getLivingPreferences, updateLivingPreferences } from "../api/preferences";
import { router } from "expo-router";

type LivingPrefs = {
  cleanliness: number | null;
  clean_up_your_space: boolean;
  cook: boolean;
  sharing_items: boolean;
  pets: boolean;
  guests: boolean;
  personality_type: string;
  sleep_schedule: string;
  smoking: boolean;
  drinking_alcohol: boolean;
};

const DEFAULT_PREFS: LivingPrefs = {
  cleanliness: 3,
  clean_up_your_space: false,
  cook: false,
  sharing_items: true,
  pets: false,
  guests: true,
  personality_type: "",
  sleep_schedule: "",
  smoking: false,
  drinking_alcohol: false,
};

export default function LivingPreferencesScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [prefs, setPrefs] = useState<LivingPrefs>(DEFAULT_PREFS);

  // Fetch existing preferences (token user)
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLivingPreferences();

        // merge to be safe if backend returns partial/nullable fields
        setPrefs({
          ...DEFAULT_PREFS,
          ...data,
          cleanliness:
            data?.cleanliness === null || data?.cleanliness === undefined
              ? DEFAULT_PREFS.cleanliness
              : data.cleanliness,
        });
      } catch (err) {
        console.log("FETCH PREF ERROR:", err);
        // keep defaults so you can still test PATCH
        setPrefs(DEFAULT_PREFS);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cleanlinessText = useMemo(() => {
    const v = prefs.cleanliness;
    if (v === null || v === undefined) return "";
    return String(v);
  }, [prefs.cleanliness]);

  const setCleanlinessFromText = (val: string) => {
    // allow empty input
    if (val.trim() === "") {
      setPrefs((p) => ({ ...p, cleanliness: null }));
      return;
    }
    // clamp 1..5
    const n = Number(val);
    if (Number.isNaN(n)) return;
    const clamped = Math.max(1, Math.min(5, n));
    setPrefs((p) => ({ ...p, cleanliness: clamped }));
  };

  const validate = () => {
    // cleanliness is optional, but if present it must be 1..5
    if (prefs.cleanliness !== null) {
      if (prefs.cleanliness < 1 || prefs.cleanliness > 5) {
        return "Cleanliness must be between 1 and 5.";
      }
    }
    return "";
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Fix this first", err);
      return;
    }

    try {
      setSaving(true);

      // PATCH only the model fields (no user id)
      const payload: LivingPrefs = {
        cleanliness: prefs.cleanliness,
        clean_up_your_space: prefs.clean_up_your_space,
        cook: prefs.cook,
        sharing_items: prefs.sharing_items,
        pets: prefs.pets,
        guests: prefs.guests,
        personality_type: prefs.personality_type,
        sleep_schedule: prefs.sleep_schedule,
        smoking: prefs.smoking,
        drinking_alcohol: prefs.drinking_alcohol,
      };

      const updated = await updateLivingPreferences(payload);
      setPrefs({ ...DEFAULT_PREFS, ...updated });

      Alert.alert("Saved", "Living preferences updated!", [
    { text: "OK", onPress: () => router.replace("/profile") },
  ]);
    } catch (err: any) {
      console.log("SAVE ERROR:", err?.response?.data || err?.message || err);
      Alert.alert("Error", "Could not save preferences (check token + API).");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Living Preferences Survey</Text>
      <Text style={styles.subtitle}>
        Dummy survey to test saving + fetching preferences for the logged-in user.
      </Text>

      {/* Cleanliness */}
      <Text style={styles.label}>Cleanliness (1–5)</Text>
      <Text style={styles.helper}>How clean do you prefer shared spaces?</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={cleanlinessText}
        onChangeText={setCleanlinessFromText}
        placeholder="3"
        placeholderTextColor="#999"
      />

      <ToggleRow
        label="I clean up my space regularly"
        value={prefs.clean_up_your_space}
        onValueChange={(v) => setPrefs((p) => ({ ...p, clean_up_your_space: v }))}
      />

      <ToggleRow
        label="I like to cook"
        value={prefs.cook}
        onValueChange={(v) => setPrefs((p) => ({ ...p, cook: v }))}
      />

      <ToggleRow
        label="I’m okay sharing items"
        value={prefs.sharing_items}
        onValueChange={(v) => setPrefs((p) => ({ ...p, sharing_items: v }))}
      />

      <ToggleRow
        label="I’m okay with pets"
        value={prefs.pets}
        onValueChange={(v) => setPrefs((p) => ({ ...p, pets: v }))}
      />

      <ToggleRow
        label="I’m okay with guests"
        value={prefs.guests}
        onValueChange={(v) => setPrefs((p) => ({ ...p, guests: v }))}
      />

      {/* Personality */}
      <Text style={styles.label}>Personality Type</Text>
      <Text style={styles.helper}>Optional (e.g., Introvert/Extrovert, MBTI).</Text>
      <TextInput
        style={styles.input}
        value={prefs.personality_type ?? ""}
        onChangeText={(v) => setPrefs((p) => ({ ...p, personality_type: v }))}
        placeholder="e.g., ENFJ"
        placeholderTextColor="#999"
      />

      {/* Sleep schedule */}
      <Text style={styles.label}>Sleep Schedule</Text>
      <Text style={styles.helper}>Optional (e.g., Night Owl / Early Bird).</Text>
      <TextInput
        style={styles.input}
        value={prefs.sleep_schedule ?? ""}
        onChangeText={(v) => setPrefs((p) => ({ ...p, sleep_schedule: v }))}
        placeholder="Night owl"
        placeholderTextColor="#999"
      />

      <ToggleRow
        label="I smoke"
        value={prefs.smoking}
        onValueChange={(v) => setPrefs((p) => ({ ...p, smoking: v }))}
      />

      <ToggleRow
        label="I drink alcohol"
        value={prefs.drinking_alcohol}
        onValueChange={(v) => setPrefs((p) => ({ ...p, drinking_alcohol: v }))}
      />

      <Pressable
        style={[styles.button, saving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.buttonText}>{saving ? "Saving..." : "Save Preferences"}</Text>
      </Pressable>
    </ScrollView>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowText}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const PRIMARY = "#0B6B55";

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F2F2F2",
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "#666",
    marginBottom: 10,
  },
  label: {
    fontWeight: "700",
    marginTop: 10,
  },
  helper: {
    color: "#666",
    marginTop: 2,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  rowText: {
    fontWeight: "600",
    color: "#111",
    flexShrink: 1,
    paddingRight: 12,
  },
  button: {
    marginTop: 18,
    backgroundColor: PRIMARY,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },
});