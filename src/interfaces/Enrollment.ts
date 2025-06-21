export interface Enrollment {
  _id: string;
  student_id: string;
  class_id: string;
  status: string;
  paymentAmount: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  paymentNotes: string;
  paymentProof: string;
  paymentSubmittedAt: string;
  billingStartDate: string;
  lastPaymentDate: string;
  nextPaymentDueDate: string;
  paymentsMade: Array<Payment>;
  priceAtEnrollment: number;
  paymentDueDate: string;
}

export interface Payment {
  _id: string;
  amount: number;
  date: string;
  status: string;
  notes: string;
  paymentDueDate: string;
  proofUrl: string;
  submittedAt: string;
  adminNotes: string;
  approvedAt: string;
}

export interface PaymentUpdate {
  status?: 'pending' | 'paid' | 'overdue' | 'rejected';
  approvedAt?: Date;
  rejectedAt?: Date;
  adminNotes?: string;
  proofUrl?: string;
  date?: Date;
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