import { useRouter } from "expo-router";
import { Button, Card } from "heroui-native";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useContacts, type ContactEntry } from "@/hooks/use-contacts";
import { useTransactions } from "@/hooks/use-transactions";
import type { TransactionType } from "@/types";

export default function AddEntryScreen() {
  const router = useRouter();
  const { addTransaction } = useTransactions();
  const { searchContacts, requestPermission } = useContacts();

  const [personName, setPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("given");
  const [interest, setInterest] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  // Contact search state
  const [contactResults, setContactResults] = useState<ContactEntry[]>([]);
  const [showContactResults, setShowContactResults] = useState(false);

  const handleContactSearch = useCallback(
    async (text: string) => {
      setPersonName(text);
      if (text.length >= 2) {
        const results = await searchContacts(text);
        setContactResults(results);
        setShowContactResults(results.length > 0);
      } else {
        setContactResults([]);
        setShowContactResults(false);
      }
    },
    [searchContacts],
  );

  const selectContact = useCallback((contact: ContactEntry) => {
    setPersonName(contact.name);
    setPhone(contact.phone ?? "");
    setContactResults([]);
    setShowContactResults(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!personName.trim()) {
      Alert.alert("Error", "Please enter a person name.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    setSaving(true);
    try {
      const parsedInterest = interest ? parseFloat(interest) : null;
      await addTransaction({
        personName: personName.trim(),
        phone: phone.trim() || null,
        amount: parsedAmount,
        type,
        interest:
          parsedInterest !== null &&
          !isNaN(parsedInterest) &&
          parsedInterest > 0
            ? parsedInterest
            : null,
        date: new Date(date).toISOString(),
      });
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save transaction.");
    } finally {
      setSaving(false);
    }
  }, [personName, amount, type, interest, date, phone, addTransaction, router]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Add Entry</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type Toggle */}
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            <Pressable style={{ flex: 1 }} onPress={() => setType("given")}>
              <Card
                variant={type === "given" ? "secondary" : "default"}
                style={[
                  styles.typeCard,
                  type === "given" && styles.typeCardActive,
                ]}
              >
                <Card.Body>
                  <Text
                    style={[
                      styles.typeText,
                      type === "given" && { color: "#E53935" },
                    ]}
                  >
                    Given
                  </Text>
                  <Text style={styles.typeHint}>Money you gave</Text>
                </Card.Body>
              </Card>
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => setType("taken")}>
              <Card
                variant={type === "taken" ? "secondary" : "default"}
                style={[
                  styles.typeCard,
                  type === "taken" && styles.typeCardActive,
                ]}
              >
                <Card.Body>
                  <Text
                    style={[
                      styles.typeText,
                      type === "taken" && { color: "#43A047" },
                    ]}
                  >
                    Taken
                  </Text>
                  <Text style={styles.typeHint}>Money you received</Text>
                </Card.Body>
              </Card>
            </Pressable>
          </View>

          {/* Person Name */}
          <Text style={styles.label}>Person</Text>
          <View>
            <TextInput
              style={styles.input}
              placeholder="Search contacts or type a name..."
              value={personName}
              onChangeText={handleContactSearch}
              autoCapitalize="words"
            />
            {showContactResults && (
              <Card variant="default" style={styles.contactDropdown}>
                <Card.Body>
                  {contactResults.slice(0, 5).map((contact, i) => (
                    <Pressable
                      key={`${contact.name}-${i}`}
                      onPress={() => selectContact(contact)}
                      style={styles.contactItem}
                    >
                      <Text style={styles.contactName}>{contact.name}</Text>
                      {contact.phone && (
                        <Text style={styles.contactPhone}>{contact.phone}</Text>
                      )}
                    </Pressable>
                  ))}
                </Card.Body>
              </Card>
            )}
          </View>
          <Pressable
            onPress={async () => {
              const granted = await requestPermission();
              if (!granted) {
                Alert.alert(
                  "Permission Required",
                  "Please allow access to contacts to search.",
                );
              }
            }}
          >
            <Text style={styles.contactsLink}>Allow contacts access</Text>
          </Pressable>

          {/* Amount */}
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          {/* Interest */}
          <Text style={styles.label}>Interest % (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 5"
            value={interest}
            onChangeText={setInterest}
            keyboardType="numeric"
          />

          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
          />

          <Button
            variant="primary"
            size="lg"
            onPress={handleSave}
            isDisabled={saving}
          >
            {saving ? "Saving..." : "Save Entry"}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
    color: "#0066FF",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  form: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    fontSize: 16,
    color: "#111",
  },
  typeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  typeCard: {
    borderWidth: 2,
    borderColor: "transparent",
  },
  typeCardActive: {
    borderColor: "#0066FF",
  },
  typeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  typeHint: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  contactDropdown: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  contactItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  contactName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  contactPhone: {
    fontSize: 13,
    color: "#888",
    marginTop: 1,
  },
  contactsLink: {
    fontSize: 13,
    color: "#0066FF",
    marginBottom: 4,
  },
});
