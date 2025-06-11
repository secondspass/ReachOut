import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import BackupModal from "../components/BackupModal";

export default function SettingsPage() {
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  /**
   * Handle data changes from backup operations
   */
  // const handleBackupDataChanged = async () => {
  //   await loadFriends(setFriends);
  // };
  return (
    <View>
      <TouchableOpacity
        style={styles.settingsOption}
        onPress={() => setBackupModalVisible(true)}
      >
        <Text style={styles.settingsText}>Backup and Restore</Text>
      </TouchableOpacity>
      <BackupModal
        visible={backupModalVisible}
        onClose={() => setBackupModalVisible(false)}
        onDataChanged={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  settingsOption: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
});
