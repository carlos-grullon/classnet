import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  status: 'pending_payment' | 'proof_submitted' | 'enrolled' | 'proof_rejected' | 'cancelled';
  paymentProof?: string;
  paymentAmount: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // Para inscripciones pendientes de pago
  notes?: string; // Para notas de rechazo u otras observaciones
}

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
    enum: ['pending_payment', 'proof_submitted', 'enrolled', 'proof_rejected', 'cancelled'],
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
  }
}, { timestamps: true });

// Índice para búsquedas eficientes
EnrollmentSchema.index({ student: 1, class: 1 }, { unique: true });

// Modelo
export default mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
