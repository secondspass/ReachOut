// Type definitions for our data structures
export interface Friend {
  id: string;
  name: string;
  contactMethod: string;
  frequencyDays: number;
  firstContactDate: string;
  lastContactDate: string;
}

export interface FrequencyOption {
  label: string;
  days: number;
}
