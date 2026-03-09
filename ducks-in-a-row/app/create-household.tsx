import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { router } from "expo-router";
import { createHousehold } from "../api/household";

export default function CreateHouseholdScreen() {
  const [householdName, setHouseholdName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) {
      Alert.alert("Missing name", "Please enter a household name.");
      return;
    }

    try {
      setLoading(true);

      await createHousehold(householdName.trim());

      router.replace("/living-preferences?mode=onboarding");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not create household.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 16 }}>
        Name Your Household
      </Text>

      <TextInput
        placeholder="Enter household name"
        value={householdName}
        onChangeText={setHouseholdName}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}
      />

      <Button
        title={loading ? "Creating..." : "Continue"}
        onPress={handleCreateHousehold}
        disabled={loading}
      />
    </View>
  );
}