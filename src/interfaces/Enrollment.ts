import { ObjectId } from "mongodb";

export interface Enrollment {
  _id?: string | ObjectId;
  student_id?: string | ObjectId;
  class_id?: string | ObjectId;
  status?: string;
  paymentAmount?: number;
  expiresAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  paymentNotes?: string;
  paymentProof?: string | null;
  paymentSubmittedAt?: string | Date;
  billingStartDate?: string | Date | null;
  lastPaymentDate?: string | Date | null;
  nextPaymentDueDate?: string | Date | null;
  paymentsMade?: Array<Payment>;
  priceAtEnrollment?: number;
  paymentDueDate?: string | Date;
  notes?: string;
}

export interface Payment {
  _id?: string;
  amount?: number;
  date?: string | Date;
  status?: string;
  notes?: string;
  paymentDueDate?: string | Date;
  proofUrl?: string;
  submittedAt?: string | Date;
  adminNotes?: string;
  approvedAt?: string | Date;
}

export interface PaymentUpdate {
  status?: 'pending' | 'paid' | 'overdue' | 'rejected';
  approvedAt?: string | Date;
  rejectedAt?: string | Date;
  adminNotes?: string;
  proofUrl?: string;
  date?: string | Date;
}

export interface EnrollmentUpdate {
  lastPaymentDate?: Date;
  nextPaymentDueDate?: Date;
  paymentsMade?: {
    [index: number]: Partial<PaymentUpdate>;
  };
  $set?: {
    status?: string;
    notes?: string;
  };
}