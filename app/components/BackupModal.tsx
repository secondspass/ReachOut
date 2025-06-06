import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { BackupService } from '../services/backupService';

interface BackupModalProps {
  visible: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export default function BackupModal({ visible, onClose, onDataChanged }: BackupModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [backupInfo, setBackupInfo] = useState<{
    friendsCount: number;
    lastBackupDate: string | null;
  }>({ friendsCount: 0, lastBackupDate: null });

  useEffect(() => {
    if (visible) {
      loadBackupInfo();
    }
  }, [visible]);

  const loadBackupInfo = async () => {
    const info = await BackupService.getBackupInfo();
    setBackupInfo(info);
  };

  const handleExport = async () => {
    if (backupInfo.friendsCount === 0) {
      Alert.alert(
        'No Data to Export',
        'You don\'t have any friends added yet. Add some friends first before creating a backup.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsExporting(true);
    try {
      const success = await BackupService.exportData();
      if (success) {
        await loadBackupInfo(); // Refresh info after export
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    Alert.alert(
      'Import Backup',
      'Importing a backup will replace all your current friend data. This action cannot be undone.\n\nDo you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: async () => {
            setIsImporting(true);
            try {
              const success = await BackupService.importData();
              if (success) {
                await loadBackupInfo(); // Refresh info after import
                onDataChanged(); // Notify parent to reload data
              }
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Backup & Restore</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Current Data Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Data</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Friends:</Text>
                <Text style={styles.infoValue}>{backupInfo.friendsCount}</Text>
              </View>
            </View>
          </View>

          {/* Export Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Backup</Text>
            <Text style={styles.sectionDescription}>
              Create a backup file that you can save to your device or cloud storage.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.exportButton]}
              onPress={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.buttonText}>Exporting...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Export Backup</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Import Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Import Backup</Text>
            <Text style={styles.sectionDescription}>
              Restore your friend data from a previously created backup file.
            </Text>
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                ⚠️ Warning: Importing will replace all current data
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.actionButton, styles.importButton]}
              onPress={handleImport}
              disabled={isImporting}
            >
              {isImporting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.buttonText}>Importing...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Import Backup</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Backup Format Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Backups</Text>
            <Text style={styles.infoText}>
              • Backup files are saved in JSON format{'\n'}
              • All friend data including names, contact preferences, and last contact dates are included{'\n'}
              • Backup files can be shared via email, cloud storage, or other apps{'\n'}
              • Keep your backup files safe and secure
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  warningCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  exportButton: {
    backgroundColor: '#28a745',
  },
  importButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});