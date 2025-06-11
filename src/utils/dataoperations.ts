import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { Friend } from "./interfaces";

/**
 * Load friends data from AsyncStorage
 */
export const loadFriends = async (
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>,
) => {
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
export const saveFriends = async (friends: Friend[]) => {
  try {
    await AsyncStorage.setItem("friends", JSON.stringify(friends));
  } catch (error) {
    console.error("Error saving friends:", error);
  }
}; // saveFriends only changes when friends changes
