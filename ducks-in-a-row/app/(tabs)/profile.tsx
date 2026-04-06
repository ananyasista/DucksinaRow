import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import { me, ProfileResponse } from "../../api/auth";
import { getLivingPreferences } from "../../api/preferences";
import { getHouseholdRoommates, Roommate } from "../../api/household";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/themed-text";

const TestUser: ProfileResponse = {
  id: "demo",
  email: "demo@example.com",
  first_name: "Demo",
  last_name: "User",
  username: "demo-user",
  household_join_code: null,
  living_preferences: {
    cleanliness: 3,
    clean_up_your_space: false,
    cook: false,
    sharing_items: true,
    pets: false,
    guests: true,
    personality_type: "TEST",
    sleep_schedule: "",
    smoking: false,
    drinking_alcohol: false,
  },
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileResponse>(TestUser);
  const [livingPrefs, setLivingPrefs] = useState<any>(null);

  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await me();
      const prefs = await getLivingPreferences();
      const rms = await getHouseholdRoommates();

      setProfile(data);
      setLivingPrefs(prefs);
      setRoommates(rms.filter((rm) => rm.id !== data.id));
    } catch (e: any) {
      console.log("PROFILE LOAD ERROR:", e?.response?.data || e?.message || e);
      setError("Couldn't load profile. Showing demo data.");
      setProfile(TestUser);
      setLivingPrefs(TestUser.living_preferences);
      setRoommates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const onLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    router.replace("/login");
  };

  return (
    <SafeAreaView style={{ flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type='title'>
          Hello, {profile.first_name || profile.username || "Roommate"}!
        </ThemedText>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 12 }} />
        ) : (
          <>
            {!!error && <Text style={styles.error}>{error}</Text>}

            {/* Profile Info */}
            <View style={styles.card}>
              <View style={styles.rowSpace}>
                <ThemedText type='boldText'>Your Profile</ThemedText>
                   <Pressable
                    onPress={() => router.push("/profile-edit?mode=edit")}
                  >
                    <IconSymbol name='pencil' color='black' size={20} style={{marginBottom:12}}/>
                </Pressable>
              </View>
              <Row label="Name" value={`${profile.first_name} ${profile.last_name}`.trim() || "N/A"} />
              <Row label="Email" value={profile.email || "N/A"} />
              <Row label="Join Code" value={profile.household_join_code ?? "N/A"} />
            </View>

            {/* Roommates */}
            <View style={styles.card}>
              <ThemedText type='boldText'>Roommates</ThemedText>

              {roommates.length ? (
                <View style={styles.avatarRow}>
                  {roommates.map((rm) => (
                    <Pressable
                      key={rm.id}
                      style={styles.avatar}
                      onPress={() => setSelectedRoommate(rm)}
                    >
                      <View
                      style={[
                        styles.avatarCircle,
                        { backgroundColor: rm.display_color || PRIMARY },
                      ]}
                    >
                      <ThemedText type='secondarySubtitle'>{initials(rm.full_name)}</ThemedText>
                    </View>
                      <ThemedText type='text' numberOfLines={1}>
                        {rm.first_name}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={styles.muted}>No roommates found.</Text>
              )}
            </View>

            {/* Living Preferences */}
            <View style={styles.card}>
              <View style={styles.rowSpace}>
                <ThemedText type='boldText'>Living Preferences</ThemedText>
                  <Pressable
                    onPress={() => router.push("/living-preferences?mode=edit")}
                  >
                    <IconSymbol name='pencil' color='black' size={20} style={{marginBottom:12}}/>
                </Pressable>
              </View>
              {livingPrefs ? (
                <>
                  <Row label="Cleanliness" value={toStr(livingPrefs.cleanliness)} />
                  <Row label="Clean up space" value={yesNo(livingPrefs.clean_up_your_space)} />
                  <Row label="Cooks" value={yesNo(livingPrefs.cook)} />
                  <Row label="Shares items" value={yesNo(livingPrefs.sharing_items)} />
                  <Row label="Pets" value={yesNo(livingPrefs.pets)} />
                  <Row label="Guests" value={yesNo(livingPrefs.guests)} />
                  <Row label="Personality" value={livingPrefs.personality_type || "N/A"} />
                  <Row label="Sleep" value={livingPrefs.sleep_schedule || "N/A"} />
                  <Row label="Smoking" value={yesNo(livingPrefs.smoking)} />
                  <Row label="Drinking" value={yesNo(livingPrefs.drinking_alcohol)} />
                </>
              ) : (
                <Text style={styles.muted}>No preferences found.</Text>
              )}
            </View>


            <Pressable style={styles.btnDanger} onPress={onLogout}>
              <ThemedText style={styles.btnDangerText}>Log out</ThemedText>
            </Pressable>

            {/* Roommate Preferences Modal */}
            <Modal
              visible={!!selectedRoommate}
              transparent
              animationType="slide"
              onRequestClose={() => setSelectedRoommate(null)}
            >
              <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>
                    {selectedRoommate?.full_name}'s Preferences
                  </Text>

                  {selectedRoommate?.living_preferences ? (
                    <>
                      <Row
                        label="Cleanliness"
                        value={toStr(selectedRoommate.living_preferences.cleanliness)}
                      />
                      <Row label="Clean up space" value={yesNo(selectedRoommate.living_preferences.clean_up_your_space)} />
                      <Row label="Cooks" value={yesNo(selectedRoommate.living_preferences.cook)} />
                      <Row label="Shares items" value={yesNo(selectedRoommate.living_preferences.sharing_items)} />
                      <Row label="Pets" value={yesNo(selectedRoommate.living_preferences.pets)} />
                      <Row label="Guests" value={yesNo(selectedRoommate.living_preferences.guests)} />
                      <Row label="Personality" value={selectedRoommate.living_preferences.personality_type || "N/A"} />
                      <Row label="Sleep" value={selectedRoommate.living_preferences.sleep_schedule || "N/A"} />
                      <Row label="Smoking" value={yesNo(selectedRoommate.living_preferences.smoking)} />
                      <Row label="Drinking" value={yesNo(selectedRoommate.living_preferences.drinking_alcohol)} />
                    </>
                  ) : (
                    <Text style={styles.muted}>No preferences found.</Text>
                  )}

                  <Pressable style={styles.btnOutline} onPress={() => setSelectedRoommate(null)}>
                    <Text style={styles.btnOutlineText}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function yesNo(v: boolean) {
  return v ? "Yes" : "No";
}

function toStr(v: any) {
  if (v === null || v === undefined || v === "") return "N/A";
  return String(v);
}

function initials(name?: string) {
  if (!name) return "R";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "R";
  const first = parts[0]?.[0] ?? "R";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type='default'>{label}</ThemedText>
      <ThemedText type='default'>{value}</ThemedText>
    </View>
  );
}

const PRIMARY = "#0B6B55";

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: "#F2F2F2",
  },
  h1: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
    marginTop: 10,
  },
  error: {
    marginTop: 10,
    color: "tomato",
    fontWeight: "600",
  },
  muted: {
    color: "#666",
  },
  card: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111",
    alignItems: 'center',
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  rowLabel: {
    color: "#555",
    fontWeight: "700",
  },
  rowValue: {
    color: "#111",
    fontWeight: "600",
    maxWidth: "70%",
    textAlign: "right",
  },

  avatarRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  avatar: {
    width: 78,
    alignItems: "center",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  avatarName: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#111",
    maxWidth: 78,
    textAlign: "center",
  },

  btnOutline: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  btnOutlineText: {
    color: PRIMARY,
    fontWeight: "900",
  },
  btnDanger: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#D63B3B",
  },
  btnDangerText: {
    color: "#fff",
    fontWeight: "900",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
    color: "#111",
  },
  rowSpace: {
      justifyContent:"space-between",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      alignContent: 'center',
  },
});
