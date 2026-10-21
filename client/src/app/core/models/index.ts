export interface Owner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string | null;
}
export type OwnerRequest = Omit<Owner, 'id'>;

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  birthDate?: string | null;
  weightKg?: number | null;
  ownerId: number;
  ownerName?: string | null;
}
export type PetRequest = Omit<Pet, 'id' | 'ownerName'>;

export interface Veterinarian {
  id: number;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  specialty?: string | null;
  email: string;
}
export type VeterinarianRequest = Omit<Veterinarian, 'id'>;

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: number;
  scheduledAt: string;
  reason: string;
  status: AppointmentStatus;
  petId: number;
  petName?: string | null;
  veterinarianId: number;
  veterinarianName?: string | null;
}
export type AppointmentRequest = Omit<Appointment, 'id' | 'petName' | 'veterinarianName'>;

export interface MedicalRecord {
  id: number;
  date: string;
  diagnosis: string;
  treatment?: string | null;
  notes?: string | null;
  petId: number;
}
export type MedicalRecordRequest = Omit<MedicalRecord, 'id'>;
