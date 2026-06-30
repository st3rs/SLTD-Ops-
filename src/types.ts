export interface RedNotice {
  id: string;
  referenceNumber: string;
  name: string;
  nationality: string;
  dateOfBirth: string;
  placeOfBirth: string;
  charges: string;
  issuingCountry: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  status: "ACTIVE" | "APPREHENDED" | "MONITORED";
  photoUrl: string;
  alias: string;
  passportNumber: string;
  lastSeenLocation: string;
  entityId?: string;
  interpolUrl?: string;
  physicalDetails?: {
    height?: string;
    weight?: string;
    eyes?: string;
    hair?: string;
    distinguishingMarks?: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: "USER" | "AGENT" | "SYSTEM";
  text: string;
  timestamp: string;
  officerName?: string;
  badgeNumber?: string;
}

export interface Checkpoint {
  id: string;
  name: string;
  type: "AIRPORT" | "LAND_BORDER" | "SEAPORT";
  location: string;
  activeOfficers: number;
  status: "NORMAL" | "ALERT" | "LOCKED";
  dailyChecks: number;
  recentFlagsCount: number;
  coords: { x: number; y: number }; // Relative percentage for mapping
}

export interface PassportScanResult {
  passportNumber: string;
  fullName: string;
  nationality: string;
  dob: string;
  gender: string;
  expiryDate: string;
  mrzMatch: boolean;
  biometricMatch: number; // 0-100 percentage
  blacklistStatus: "CLEARED" | "FLAGGED_LOCAL" | "FLAGGED_INTERPOL";
  remarks: string;
}

export interface BorderLog {
  id: string;
  timestamp: string;
  location: string;
  passengerName: string;
  nationality: string;
  status: "PASSED" | "FLAGGED" | "DETAINED";
  actionTaken: string;
}

export interface GlobalWatchlistProfile {
  id: string;
  referenceNumber: string;
  name: string;
  alias: string;
  nationality: string;
  passportNumber: string;
  charges: string;
  sourceDB: "INTERPOL_SLTD" | "EUROPOL" | "FBI_MOST_WANTED" | "MANUAL_ENTRY" | "OPENSANCTIONS";
  riskScore: number; // 0 - 100
  lastKnownCountry: string;
  status: "WANTED" | "MONITORED" | "APPREHENDED";
  opensanctionsUrl?: string;
}

