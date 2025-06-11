import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { Friend } from "../utils/interfaces";

export interface BackupData {
  version: string;
  timestamp: string;
  friends: Friend[];
}

export class BackupService {
  private static readonly BACKUP_VERSION = "1.0.0";
  private static readonly STORAGE_KEY = "friends";

  /**
   * Export friends data to a JSON file
   */
  static async exportData(): Promise<boolean> {
    try {
      // Get friends data from AsyncStorage
      const friendsData = await AsyncStorage.getItem(this.STORAGE_KEY);
      const friends: Friend[] = friendsData ? JSON.parse(friendsData) : [];

      // Create backup data structure
      const backupData: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        friends: friends,
      };

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `friend-reminder-backup-${timestamp}.json`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      // Write backup data to file
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(backupData, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 },
      );

      // Check if sharing is available
      const sharingAvailable = await Sharing.isAvailableAsync();

      if (sharingAvailable) {
        // Share the backup file
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Save Friend Reminder Backup",
          UTI: "public.json",
        });
      } else {
        Alert.alert(
          "Backup Created",
          `Backup saved to: ${fileUri}\n\nNote: Sharing is not available on this device.`,
          [{ text: "OK" }],
        );
      }

      return true;
    } catch (error) {
      console.error("Error exporting data:", error);
      Alert.alert(
        "Export Failed",
        "Failed to create backup. Please try again.",
        [{ text: "OK" }],
      );
      return false;
    }
  }

  /**
   * Import friends data from a JSON file
   */
  static async importData(): Promise<boolean> {
    try {
      // Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return false;
      }

      const fileUri = result.assets[0].uri;

      // Read the file content
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Parse and validate the backup data
      const backupData: BackupData = JSON.parse(fileContent);

      if (!this.validateBackupData(backupData)) {
        Alert.alert(
          "Invalid Backup File",
          "The selected file is not a valid Friend Reminder backup.",
          [{ text: "OK" }],
        );
        return false;
      }

      // Show confirmation dialog
      return new Promise((resolve) => {
        Alert.alert(
          "Import Backup",
          `This backup contains ${backupData.friends.length} friends and was created on ${new Date(backupData.timestamp).toLocaleDateString()}.\n\nImporting will replace all current data. Continue?`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: "Import",
              style: "destructive",
              onPress: async () => {
                try {
                  // Save the imported data to AsyncStorage
                  await AsyncStorage.setItem(
                    this.STORAGE_KEY,
                    JSON.stringify(backupData.friends),
                  );

                  Alert.alert(
                    "Import Successful",
                    `Successfully imported ${backupData.friends.length} friends.`,
                    [{ text: "OK" }],
                  );

                  resolve(true);
                } catch (error) {
                  console.error("Error importing data:", error);
                  Alert.alert(
                    "Import Failed",
                    "Failed to import backup data. Please try again.",
                    [{ text: "OK" }],
                  );
                  resolve(false);
                }
              },
            },
          ],
        );
      });
    } catch (error) {
      console.error("Error importing data:", error);
      Alert.alert(
        "Import Failed",
        "Failed to read backup file. Please ensure the file is valid.",
        [{ text: "OK" }],
      );
      return false;
    }
  }

  /**
   * Validate backup data structure
   */
  private static validateBackupData(data: any): data is BackupData {
    if (!data || typeof data !== "object") {
      return false;
    }

    if (!data.version || !data.timestamp || !Array.isArray(data.friends)) {
      return false;
    }

    // Validate each friend object
    for (const friend of data.friends) {
      if (
        !friend.id ||
        !friend.name ||
        !friend.contactMethod ||
        typeof friend.frequencyDays !== "number" ||
        !friend.lastContactDate
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get backup file info for display
   */
  static async getBackupInfo(): Promise<{
    friendsCount: number;
    lastBackupDate: string | null;
  }> {
    try {
      const friendsData = await AsyncStorage.getItem(this.STORAGE_KEY);
      const friends: Friend[] = friendsData ? JSON.parse(friendsData) : [];

      return {
        friendsCount: friends.length,
        lastBackupDate: null, // We don't track backup dates currently
      };
    } catch (error) {
      console.error("Error getting backup info:", error);
      return {
        friendsCount: 0,
        lastBackupDate: null,
      };
    }
  }
}
