import React, { useCallback, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { me, MeResponse } from "../api/auth";

const TestUser: MeResponse = {
  id: "demo",
  email: "demo@example.com",
  first_name: "Demo",
  last_name: "User",
  username: "demo-user",
  household_join_code: null,
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<MeResponse>(TestUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await me();
      setProfile(data);
    } catch (e: any) {
      console.log("PROFILE LOAD ERROR:", e?.message || e);
      setError("Couldn’t load profile. Showing demo data.");
      setProfile(TestUser);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch every time user visits the Profile tab
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
    <View style={styles.container}>
      <Text style={styles.h1}>
        Hello, {profile.first_name || profile.username || "Roommate"}!
      </Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 12 }} />
      ) : (
        <>
          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Profile</Text>

            <Row label="Name" value={`${profile.first_name} ${profile.last_name}`} />
            <Row label="Email" value={profile.email} />
            <Text>Join Code: {profile.household_join_code ?? "N/A"}</Text>
          </View>

          <Pressable style={styles.btnOutline} onPress={loadProfile}>
            <Text style={styles.btnOutlineText}>Refresh</Text>
          </Pressable>

          <Pressable style={styles.btnDanger} onPress={onLogout}>
            <Text style={styles.btnDangerText}>Log out</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const PRIMARY = "#0B6B55";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    padding: 18,
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
});