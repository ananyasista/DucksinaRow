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
import { ThemedText } from "@/components/themed-text";

type LivingPrefs = {
  cleanliness: number | null;
  clean_up_your_space: boolean;
  cook: boolean;
  sharing_items: boolean;
  pets: boolean;
  guests: boolean;
  personality_type: "extrovert" | "ambivert" | "introvert" | "";
  sleep_schedule: "morning riser" | "night owl" | "flexible" | "";
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

const SCALE_OPTIONS = [1, 2, 3, 4, 5];

export default function LivingPreferencesScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<LivingPrefs>(DEFAULT_PREFS);
  const { mode } = useLocalSearchParams<{ mode: string }>();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLivingPreferences();

        setPrefs({
          ...DEFAULT_PREFS,
          ...data,
        });
      } catch (err) {
        console.log("FETCH PREF ERROR:", err);
        setPrefs(DEFAULT_PREFS);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const validate = () => {
    if (prefs.cleanliness !== null && (prefs.cleanliness < 1 || prefs.cleanliness > 5)) {
      return "Cleanliness must be between 1 and 5.";
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

    // Living Preference Survey
    if (mode === "edit") {
        router.replace("/profile");
    } else {
        router.replace("/(tabs)");
    }
    } catch (err: any) {
      console.log("SAVE ERROR:", err?.response?.data || err?.message || err);
      Alert.alert("Error", "Could not save preferences.");
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
        <ThemedText style={styles.backText}>← Back</ThemedText>
      </Pressable>

      <ThemedText type='title'>Living Preferences Survey</ThemedText>
      <ThemedText style={styles.subtitle}>
        Answer these questions so your preferences can be saved to your profile.
      </ThemedText>

      <ScaleQuestion
        question="1. How clean do you prefer shared living spaces to be?"
        value={prefs.cleanliness}
        onSelect={(value) => setPrefs((p) => ({ ...p, cleanliness: value }))}
      />

      <BooleanQuestion
        question="2. Do you usually clean up your space after yourself?"
        value={prefs.clean_up_your_space}
        onSelect={(value) => setPrefs((p) => ({ ...p, clean_up_your_space: value }))}
      />

      <BooleanQuestion
        question="3. Do you cook at home?"
        value={prefs.cook}
        onSelect={(value) => setPrefs((p) => ({ ...p, cook: value }))}
      />

      <BooleanQuestion
        question="4. Are you comfortable sharing household items?"
        value={prefs.sharing_items}
        onSelect={(value) => setPrefs((p) => ({ ...p, sharing_items: value }))}
      />

      <BooleanQuestion
        question="5. Are you comfortable living with pets?"
        value={prefs.pets}
        onSelect={(value) => setPrefs((p) => ({ ...p, pets: value }))}
      />

      <BooleanQuestion
        question="6. Are you okay with guests in the home?"
        value={prefs.guests}
        onSelect={(value) => setPrefs((p) => ({ ...p, guests: value }))}
      />

      <ChoiceQuestion
        question="7. How would you describe your personality?"
        options={["extrovert", "ambivert", "introvert"]}
        value={prefs.personality_type}
        onSelect={(value) =>
          setPrefs((p) => ({
            ...p,
            personality_type: value as LivingPrefs["personality_type"],
          }))
        }
      />

      <ChoiceQuestion
        question="8. What best describes your sleep schedule?"
        options={["morning riser", "night owl", "flexible"]}
        value={prefs.sleep_schedule}
        onSelect={(value) =>
          setPrefs((p) => ({
            ...p,
            sleep_schedule: value as LivingPrefs["sleep_schedule"],
          }))
        }
      />

      <BooleanQuestion
        question="9. Do you smoke?"
        value={prefs.smoking}
        onSelect={(value) => setPrefs((p) => ({ ...p, smoking: value }))}
      />

      <BooleanQuestion
        question="10. Do you drink alcohol?"
        value={prefs.drinking_alcohol}
        onSelect={(value) => setPrefs((p) => ({ ...p, drinking_alcohol: value }))}
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

function ScaleQuestion({
  question,
  value,
  onSelect,
}: {
  question: string;
  value: number | null;
  onSelect: (value: number) => void;
}) {
  return (
    <View style={styles.questionBlock}>
      <ThemedText style={styles.label}>{question}</ThemedText>
      <View style={styles.optionRow}>
        {SCALE_OPTIONS.map((option) => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              style={[styles.scaleChip, selected && styles.selectedChip]}
              onPress={() => onSelect(option)}
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

function BooleanQuestion({
  question,
  value,
  onSelect,
}: {
  question: string;
  value: boolean;
  onSelect: (value: boolean) => void;
}) {
  return (
    <View style={styles.questionBlock}>
      <ThemedText style={styles.label}>{question}</ThemedText>
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

function ChoiceQuestion({
  question,
  options,
  value,
  onSelect,
}: {
  question: string;
  options: string[];
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.questionBlock}>
      <ThemedText style={styles.label}>{question}</ThemedText>
      <View style={styles.choiceContainer}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              style={[styles.choiceChip, selected && styles.selectedChip]}
              onPress={() => onSelect(option)}
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