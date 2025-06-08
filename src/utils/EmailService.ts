import nodemailer from 'nodemailer';

// Configuración del transportador de correo
// En producción, deberías configurar un servicio SMTP real
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

// Dirección de correo desde la que se envían los mensajes
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@classnet.com';

/**
 * Envía un correo electrónico usando Nodemailer
 * @param to Dirección de correo del destinatario
 * @param subject Asunto del correo
 * @param textContent Contenido en texto plano
 * @param htmlContent Contenido en HTML
 * @returns Promise que se resuelve cuando el correo es enviado
 */
export async function sendEmail(
  to: string,
  subject: string,
  textContent: string,
  htmlContent: string
) {

  const mailOptions = {
    from: FROM_EMAIL,
    to,
    subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return false;
  }
}

/**
 * Envía un correo de confirmación de inscripción
 * @param studentEmail Email del estudiante
 * @param studentName Nombre del estudiante
 * @param className Nombre de la clase
 * @param classDetails Detalles adicionales de la clase
 */
export async function sendEnrollmentConfirmationEmail(
  studentEmail: string,
  studentName: string,
  className: string,
  classLevel: string,
  classDetails: {
    teacherName?: string;
    schedule?: string;
    startDate?: string;
    price?: string;
  } = {}
) {
  const subject = '¡Inscripción Confirmada! - ClassNet';
  
  const textContent = `
    Hola ${studentName},
    
    Tu inscripción a la clase "${className}" ha sido confirmada.
    
    Detalles de la clase:
    - Profesor: ${classDetails.teacherName || 'No especificado'}
    - Horario: ${classDetails.schedule || 'No especificado'}
    - Precio: ${classDetails.price || 'No especificado'}
    - Fecha de inicio: ${classDetails.startDate || 'No especificada'}
    
    Gracias por confiar en ClassNet para tu educación.
    
    Saludos,
    El equipo de ClassNet
  `;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">¡Inscripción Confirmada!</h2>
      <p>Hola <strong>${studentName}</strong>,</p>
      <p>Tu inscripción a la clase <strong>"${className} ${classLevel}"</strong> ha sido confirmada.</p>
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #4a5568; margin-top: 0;">Detalles de la clase:</h3>
        <ul style="padding-left: 20px;">
          <li><strong>Profesor:</strong> ${classDetails.teacherName || 'No especificado'}</li>
          <li><strong>Horario:</strong> ${classDetails.schedule || 'No especificado'}</li>
          <li><strong>Precio:</strong> ${classDetails.price || 'No especificado'}</li>
          <li><strong>Fecha de inicio:</strong> ${classDetails.startDate || 'No especificada'}</li>
        </ul>
      </div>
      
      <p>Gracias por confiar en ClassNet para tu educación.</p>
      
      <p>Saludos,<br>El equipo de ClassNet</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096;">
        <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
      </div>
    </div>
  `;
  
  return sendEmail(studentEmail, subject, textContent, htmlContent);
}

/**
 * Envía un correo de rechazo de comprobante de pago
 * @param studentEmail Email del estudiante
 * @param studentName Nombre del estudiante
 * @param className Nombre de la clase
 * @param rejectionReason Motivo del rechazo
 */
export async function sendPaymentRejectionEmail(
  studentEmail: string,
  studentName: string,
  className: string,
  classLevel: string,
  rejectionReason: string
) {
  const subject = 'Acción Requerida: Comprobante de Pago Rechazado - ClassNet';
  
  const textContent = `
    Hola ${studentName},
    
    Tu comprobante de pago para la clase "${className} ${classLevel}" ha sido rechazado.
    
    Motivo: ${rejectionReason || 'No se especificó un motivo'}
    
    Por favor, sube un nuevo comprobante de pago válido para completar tu inscripción.
    
    Si tienes alguna pregunta, no dudes en contactarnos.
    
    Saludos,
    El equipo de ClassNet
  `;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">Acción Requerida: Comprobante de Pago Rechazado</h2>
      <p>Hola <strong>${studentName}</strong>,</p>
      <p>Tu comprobante de pago para la clase <strong>"${className}"</strong> ha sido rechazado.</p>
      
      <div style="background-color: #fff5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e53e3e;">
        <p style="margin: 0;"><strong>Motivo:</strong> ${rejectionReason || 'No se especificó un motivo'}</p>
      </div>
      
      <p>Por favor, sube un nuevo comprobante de pago válido para completar tu inscripción.</p>
      
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      
      <p>Saludos,<br>El equipo de ClassNet</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096;">
        <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
      </div>
    </div>
  `;
  
  return sendEmail(studentEmail, subject, textContent, htmlContent);
}