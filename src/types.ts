export interface PatientData {
  age: string;
  gender: string;
  timeInHospital: number;
  numLabProcedures: number;
  numProcedures: number;
  numMedications: number;
  numDiagnoses: number;
  diabetesMed: string;
  change: string;
  admissionType: string;
  dischargeDisposition: string;
}

export interface PredictionResponse {
  readmission_probability: number;
  risk_level: string;
  timestamp: string;
}

export type UserRole = 'Doctor' | 'Nurse' | 'Administrator';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
}
