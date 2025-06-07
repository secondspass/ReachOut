import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  AppState,
  Alert,
  Modal,
  ScrollView,
  AppStateStatus,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackupModal from "./components/BackupModal";

// Type definitions for our data structures
interface Friend {
  id: string;
  name: string;
  contactMethod: string;
  frequencyDays: number;
  lastContactDate: string;
}

interface FrequencyOption {
  label: string;
  days: number;
}

// Predefined frequency options
const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { label: "Every day", days: 1 },
  { label: "Every 3 days", days: 3 },
  { label: "Every week", days: 7 },
  { label: "Every 2 weeks", days: 14 },
  { label: "Every month", days: 30 },
  { label: "Every 3 months", days: 90 },
  { label: "Every 6 months", days: 180 },
  { label: "Every year", days: 365 },
];

const CONTACT_METHODS = [
  "Text message",
  "Phone call",
  "Email",
  "In person",
  "Video call",
];

function useAppState() {
  const currentState = AppState.currentState;
  const [appState, setAppState] = useState(currentState);

  useEffect(() => {
    function onChange(newState: AppStateStatus) {
      setAppState(newState);
    }

    const subscription = AppState.addEventListener("change", onChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return appState;
}

export default function App() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const currentAppState = useAppState();

  /**
   * Load friends data from AsyncStorage
   */
  const loadFriends = async () => {
    try {
      const savedFriends = await AsyncStorage.getItem("friends");
      if (savedFriends) {
        setFriends(JSON.parse(savedFriends));
      }
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  };

  /**
   * Save friends data to AsyncStorage
   */
  const saveFriends = useCallback(async () => {
    try {
      await AsyncStorage.setItem("friends", JSON.stringify(friends));
    } catch (error) {
      console.error("Error saving friends:", error);
    }
  }, [friends]); // saveFriends only changes when friends changes

  // Load friends from storage when app starts
  useEffect(() => {
    loadFriends();
  }, []);

  // Now include saveFriends in the dependency array
  useEffect(() => {
    saveFriends();
  }, [saveFriends]);

  // rerender when app is brought to foreground
  useEffect(() => {
    if (currentAppState === "active") {
      console.log("App is active, refreshing...");
      loadFriends();
    }
  }, [currentAppState]);

  /**
   * Calculate days remaining until next contact
   */
  const getDaysUntilContact = (friend: Friend): number => {
    const lastContact = new Date(friend.lastContactDate);
    const nextContact = new Date(
      lastContact.getTime() + friend.frequencyDays * 24 * 60 * 60 * 1000,
    );
    const today = new Date();
    const diffTime = nextContact.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Get display text for days remaining
   */
  const getDaysText = (daysRemaining: number): string => {
    if (daysRemaining < 0) {
      return `${Math.abs(daysRemaining)} days overdue`;
    } else if (daysRemaining === 0) {
      return "Contact today!";
    } else {
      return `${daysRemaining} days left`;
    }
  };

  /**
   * Get color for days remaining display
   */
  const getDaysColor = (daysRemaining: number): string => {
    if (daysRemaining < 0) return "#FF4444"; // Red for overdue
    if (daysRemaining === 0) return "#FF8800"; // Orange for today
    if (daysRemaining <= 3) return "#FFAA00"; // Yellow for soon
    return "#44AA44"; // Green for good
  };

  /**
   * Mark a friend as contacted today
   */
  const markAsContacted = (friendId: string) => {
    setFriends((prevFriends) =>
      prevFriends.map((friend) =>
        friend.id === friendId
          ? { ...friend, lastContactDate: new Date().toISOString() }
          : friend,
      ),
    );
  };

  /**
   * Delete a friend from the list
   */
  const deleteFriend = (friendId: string) => {
    Alert.alert(
      "Delete Friend",
      "Are you sure you want to remove this friend from your list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setFriends((prevFriends) =>
              prevFriends.filter((f) => f.id !== friendId),
            );
          },
        },
      ],
    );
  };

  /**
   * Open modal to add a new friend
   */
  const addNewFriend = () => {
    setEditingFriend(null);
    setModalVisible(true);
  };

  /**
   * Open modal to edit an existing friend
   */
  const editFriend = (friend: Friend) => {
    setEditingFriend(friend);
    setModalVisible(true);
  };

  /**
   * Handle data changes from backup operations
   */
  const handleBackupDataChanged = async () => {
    await loadFriends();
  };

  /**
   * Render individual friend item in the list
   */
  const renderFriendItem = ({ item }: { item: Friend }) => {
    const daysRemaining = getDaysUntilContact(item);
    const daysText = getDaysText(daysRemaining);
    const daysColor = getDaysColor(daysRemaining);

    return (
      <View style={styles.friendItem}>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.contactMethod}>{item.contactMethod}</Text>
          <Text style={[styles.daysRemaining, { color: daysColor }]}>
            {daysText}
          </Text>
        </View>
        <View style={styles.friendActions}>
          <TouchableOpacity
            style={styles.contactedButton}
            onPress={() => markAsContacted(item.id)}
          >
            <Text style={styles.buttonText}>Contacted</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => editFriend(item)}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteFriend(item.id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /**
   * Sort friends by days remaining (overdue first, then by urgency)
   */
  const sortedFriends = [...friends].sort((a, b) => {
    const aDays = getDaysUntilContact(a);
    const bDays = getDaysUntilContact(b);
    return aDays - bDays;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friend Contact Tracker</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.backupButton}
            onPress={() => setBackupModalVisible(true)}
          >
            <Text style={styles.backupButtonText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={addNewFriend}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {friends.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No friends added yet.</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedFriends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
          style={styles.friendsList}
        />
      )}

      <FriendModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(friend) => {
          if (editingFriend) {
            // Update existing friend
            setFriends((prevFriends) =>
              prevFriends.map((f) => (f.id === editingFriend.id ? friend : f)),
            );
          } else {
            // Add new friend
            setFriends((prevFriends) => [...prevFriends, friend]);
          }
          setModalVisible(false);
        }}
        editingFriend={editingFriend}
      />

      <BackupModal
        visible={backupModalVisible}
        onClose={() => setBackupModalVisible(false)}
        onDataChanged={handleBackupDataChanged}
      />
    </View>
  );
}

/**
 * Modal component for adding/editing friends
 */
interface FriendModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (friend: Friend) => void;
  editingFriend: Friend | null;
}

function FriendModal({
  visible,
  onClose,
  onSave,
  editingFriend,
}: FriendModalProps) {
  const [name, setName] = useState("");
  const [contactMethod, setContactMethod] = useState(CONTACT_METHODS[0]);
  const [frequencyDays, setFrequencyDays] = useState(FREQUENCY_OPTIONS[2].days); // Default to weekly
  const [customDays, setCustomDays] = useState("");
  const [isCustomSelected, setIsCustomSelected] = useState(false);

  // Reset form when modal opens/closes or editing friend changes
  useEffect(() => {
    if (visible) {
      if (editingFriend) {
        setName(editingFriend.name);
        setContactMethod(editingFriend.contactMethod);

        // Check if the frequency matches a predefined option
        const predefinedOption = FREQUENCY_OPTIONS.find(
          (opt) => opt.days === editingFriend.frequencyDays,
        );
        if (predefinedOption) {
          setFrequencyDays(editingFriend.frequencyDays);
          setIsCustomSelected(false);
          setCustomDays("");
        } else {
          // It's a custom frequency
          setFrequencyDays(editingFriend.frequencyDays);
          setIsCustomSelected(true);
          setCustomDays(editingFriend.frequencyDays.toString());
        }
      } else {
        setName("");
        setContactMethod(CONTACT_METHODS[0]);
        setFrequencyDays(FREQUENCY_OPTIONS[2].days);
        setIsCustomSelected(false);
        setCustomDays("");
      }
    }
  }, [visible, editingFriend]);

  /**
   * Handle selecting a predefined frequency option
   */
  const handleFrequencySelect = (days: number) => {
    setFrequencyDays(days);
    setIsCustomSelected(false);
    setCustomDays("");
  };

  /**
   * Handle selecting custom frequency option
   */
  const handleCustomSelect = () => {
    setIsCustomSelected(true);
    if (customDays && !isNaN(parseInt(customDays))) {
      setFrequencyDays(parseInt(customDays));
    }
  };

  /**
   * Handle custom days input change
   */
  const handleCustomDaysChange = (text: string) => {
    setCustomDays(text);
    const days = parseInt(text);
    if (!isNaN(days) && days > 0) {
      setFrequencyDays(days);
    }
  };

  /**
   * Handle saving the friend
   */
  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a friend's name");
      return;
    }

    // Validate custom days if custom option is selected
    if (isCustomSelected) {
      const days = parseInt(customDays);
      if (!customDays || isNaN(days) || days <= 0) {
        Alert.alert(
          "Error",
          "Please enter a valid number of days (greater than 0)",
        );
        return;
      }
      setFrequencyDays(days);
    }

    const friend: Friend = {
      id: editingFriend?.id || Date.now().toString(),
      name: name.trim(),
      contactMethod,
      frequencyDays: isCustomSelected ? parseInt(customDays) : frequencyDays,
      lastContactDate:
        editingFriend?.lastContactDate || new Date().toISOString(),
    };

    onSave(friend);
  };

  /**
   * Get frequency label from days
   */

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editingFriend ? "Edit Friend" : "Add Friend"}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter friend's name"
          />

          <Text style={styles.fieldLabel}>Contact Method</Text>
          <View style={styles.optionsContainer}>
            {CONTACT_METHODS.map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.optionButton,
                  contactMethod === method && styles.selectedOption,
                ]}
                onPress={() => setContactMethod(method)}
              >
                <Text
                  style={[
                    styles.optionText,
                    contactMethod === method && styles.selectedOptionText,
                  ]}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Contact Frequency</Text>
          <View style={styles.optionsContainer}>
            {FREQUENCY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.days}
                style={[
                  styles.optionButton,
                  !isCustomSelected &&
                    frequencyDays === option.days &&
                    styles.selectedOption,
                ]}
                onPress={() => handleFrequencySelect(option.days)}
              >
                <Text
                  style={[
                    styles.optionText,
                    !isCustomSelected &&
                      frequencyDays === option.days &&
                      styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Custom frequency option */}
            <TouchableOpacity
              style={[
                styles.optionButton,
                isCustomSelected && styles.selectedOption,
              ]}
              onPress={handleCustomSelect}
            >
              <Text
                style={[
                  styles.optionText,
                  isCustomSelected && styles.selectedOptionText,
                ]}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>

          {/* Custom days input - shown when custom is selected */}
          {isCustomSelected && (
            <View style={styles.customInputContainer}>
              <Text style={styles.customInputLabel}>Every</Text>
              <TextInput
                style={styles.customDaysInput}
                value={customDays}
                onChangeText={handleCustomDaysChange}
                placeholder="7"
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={styles.customInputLabel}>days</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingTop: 50,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    paddingRight: 10,
    paddingLeft: 1,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  friendsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  backupButton: {
    backgroundColor: "#6c757d",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 40,
    minHeight: 40,
  },
  backupButtonText: {
    fontSize: 16,
  },
  friendItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  contactMethod: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  daysRemaining: {
    fontSize: 14,
    fontWeight: "600",
  },
  friendActions: {
    flexDirection: "row",
    gap: 8,
  },
  contactedButton: {
    backgroundColor: "#44AA44",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: "#FF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cancelButton: {
    color: "#007AFF",
    fontSize: 16,
  },
  saveButton: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    marginTop: 20,
  },
  textInput: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedOption: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
  },
  selectedOptionText: {
    color: "white",
    fontWeight: "600",
  },
  customInputContainer: {
    marginTop: 10,
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  customDaysInput: {
    backgroundColor: "white",
    borderRadius: 2,
    paddingHorizontal: 1,
    paddingVertical: 2,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    textAlign: "left",
  },
});
