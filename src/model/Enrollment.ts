import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment {
  amount: number;
  date: Date;
  proofUrl?: string;
  status: 'paid' | 'pending' | 'overdue';
  notes?: string;
}

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  status: 'pending_payment' | 'proof_submitted' | 'enrolled' | 'proof_rejected' | 'cancelled' | 'suspended_due_to_non_payment';
  paymentProof?: string;
  paymentAmount: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // Para inscripciones pendientes de pago
  notes?: string; // Para notas de rechazo u otras observaciones
  
  // Campos para pagos mensuales
  enrollmentDate: Date; // Fecha en que el estudiante se inscribió
  priceAtEnrollment: number; // Precio que pagó el estudiante al inscribirse
  billingStartDate?: Date; // Fecha de inicio de la facturación mensual (cuando la clase comienza)
  nextPaymentDueDate?: Date; // Fecha del próximo pago
  lastPaymentDate?: Date; // Fecha del último pago recibido
  paymentsMade?: IPayment[]; // Historial de pagos realizados
}

const PaymentSchema: Schema = new Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  proofUrl: { type: String },
  status: { 
    type: String, 
    enum: ['paid', 'pending', 'overdue'], 
    default: 'pending' 
  },
  notes: { type: String }
});

const EnrollmentSchema: Schema = new Schema({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  class: { 
    type: Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending_payment', 'proof_submitted', 'enrolled', 'proof_rejected', 'cancelled', 'suspended_due_to_non_payment'],
    default: 'pending_payment',
    required: true 
  },
  paymentProof: { 
    type: String 
  },
  paymentAmount: { 
    type: Number, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date 
  },
  notes: { 
    type: String 
  },
  
  // Campos para pagos mensuales
  enrollmentDate: { 
    type: Date, 
    default: Date.now 
  },
  priceAtEnrollment: { 
    type: Number 
  },
  billingStartDate: { 
    type: Date 
  },
  nextPaymentDueDate: { 
    type: Date 
  },
  lastPaymentDate: { 
    type: Date 
  },
  paymentsMade: [PaymentSchema]
}, { timestamps: true });

// Índice para búsquedas eficientes
EnrollmentSchema.index({ student: 1, class: 1 }, { unique: true });

// Modelo
export default mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
