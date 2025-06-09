import nodemailer from 'nodemailer';

// Configuración del transportador de correo
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@classnet.com';

const getLevel = (level: string): string => {
  switch (level) {
    case '1': return 'Principiante';
    case '2': return 'Intermedio';
    case '3': return 'Avanzado';
    default: return level;
  }
};

// Configuración del transportador de correo
// En producción, deberías configurar un servicio SMTP real
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

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
 * @param classLevel Nivel de la clase
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
    - Fecha de inicio: ${classDetails.startDate ? classDetails.startDate : 'No especificada'}
    
    Gracias por confiar en ClassNet para tu educación.
    
    Saludos,
    El equipo de ClassNet
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">¡Inscripción Confirmada!</h2>
      <p>Hola <strong>${studentName}</strong>,</p>
      <p>Tu inscripción a la clase <strong>"${className} ${getLevel(classLevel)}"</strong> ha sido confirmada.</p>
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #4a5568; margin-top: 0;">Detalles de la clase:</h3>
        <ul style="padding-left: 20px;">
          <li><strong>Profesor:</strong> ${classDetails.teacherName || 'No especificado'}</li>
          <li><strong>Horario:</strong> ${classDetails.schedule || 'No especificado'}</li>
          <li><strong>Precio:</strong> ${classDetails.price || 'No especificado'}</li>
          <li><strong>Fecha de inicio:</strong> ${classDetails.startDate ? classDetails.startDate : 'No especificada'}</li>
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
 * @param classLevel Nivel de la clase
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
    
    Tu comprobante de pago para la clase "${className} ${getLevel(classLevel)}" ha sido rechazado.
    
    Motivo: ${rejectionReason || 'No se especificó un motivo'}
    
    Por favor, sube un nuevo comprobante de pago válido lo antes posible para asegurar tu cupo en la clase.
    
    Si tienes alguna pregunta, no dudes en contactarnos.
    
    Saludos,
    El equipo de ClassNet
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">Comprobante de Pago Rechazado</h2>
      <p>Hola <strong>${studentName}</strong>,</p>
      <p>Tu comprobante de pago para la clase <strong>"${className}"</strong> ha sido rechazado.</p>
      
      <div style="background-color: #fff5f5; padding: 15px; border-left: 4px solid #e53e3e; margin: 20px 0;">
        <p><strong>Motivo del rechazo:</strong> ${rejectionReason || 'No se especificó un motivo'}</p>
      </div>
      
      <p>Por favor, sube un nuevo comprobante de pago válido lo antes posible para asegurar tu cupo en la clase.</p>
      
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      
      <p style="margin-top: 30px;">
        Saludos,<br>
        El equipo de ClassNet
      </p>
    </div>
  `;

  return await sendEmail(studentEmail, subject, textContent, htmlContent);
}

/**
 * Envía una notificación por correo electrónico a un estudiante cuando su clase comienza
 */
export async function sendClassStartNotification(
  studentEmail: string,
  studentName: string,
  className: string,
  classLevel: string,
  details: {
    startDate: string;
    nextPaymentDate: string;
  }
) {
  const subject = '¡Tu clase ha comenzado! - ClassNet';

  const textContent = `
    Hola ${studentName},
    
    ¡Buenas noticias! Tu clase "${className} ${getLevel(classLevel)}" ha comenzado oficialmente el ${details.startDate}.
    
    Información importante:
    - Fecha de inicio: ${details.startDate}
    - Fecha del próximo pago mensual: ${details.nextPaymentDate}
    
    Recuerda que deberás realizar un pago mensual para continuar en la clase. Te enviaremos recordatorios antes de la fecha de vencimiento.
    
    ¡Te deseamos mucho éxito en tu aprendizaje!
    
    Saludos,
    El equipo de ClassNet
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #38a169;">¡Tu clase ha comenzado!</h2>
      <p>Hola <strong>${studentName}</strong>,</p>
      <p>¡Buenas noticias! Tu clase <strong>"${className} ${getLevel(classLevel)}"</strong> ha comenzado oficialmente.</p>
      
      <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #38a169; margin-top: 0;">Información importante:</h3>
        <ul style="padding-left: 20px;">
          <li><strong>Fecha de inicio:</strong> ${details.startDate}</li>
          <li><strong>Fecha del próximo pago mensual:</strong> ${details.nextPaymentDate}</li>
        </ul>
      </div>
      
      <p>Recuerda que deberás realizar un pago mensual para continuar en la clase. Te enviaremos recordatorios antes de la fecha de vencimiento.</p>
      
      <p>¡Te deseamos mucho éxito en tu aprendizaje!</p>
      
      <p style="margin-top: 30px;">
        Saludos,<br>
        El equipo de ClassNet
      </p>
    </div>
  `;

  return await sendEmail(studentEmail, subject, textContent, htmlContent);
}

/**
 * Envía un recordatorio de pago mensual a un estudiante
 */
export async function sendPaymentReminderEmail(
  studentEmail: string,
  studentName: string,
  className: string,
  classLevel: string,
  details: {
    dueDate: string;
    amount: number;
    currency: string;
    urgent?: boolean;
  }
) {
  const subject = details.urgent
    ? 'URGENTE: Tu pago mensual vence mañana - ClassNet'
    : 'Recordatorio de pago mensual - ClassNet';

  const textContent = `
    Hola ${studentName},
    
    Este es un recordatorio de que tu pago mensual para la clase "${className} ${getLevel(classLevel)}" vence el ${details.dueDate}.
    
    Detalles del pago:
    - Monto: ${details.amount} ${details.currency}
    - Fecha límite: ${details.dueDate}
    ${details.urgent ? '- ¡URGENTE! Tu pago vence mañana.' : ''}
    
    Para realizar el pago, ingresa a tu cuenta de ClassNet y sube tu comprobante de pago en la sección de "Mis Inscripciones".
    
    Si ya realizaste el pago, por favor ignora este mensaje.
    
    Saludos,
    El equipo de ClassNet
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${details.urgent ? '#e53e3e' : '#3182ce'};">${details.urgent ? 'URGENTE: ' : ''}Recordatorio de Pago Mensual</h2>
      <p>Hola <strong>${studentName}</strong>,</p>
      <p>Este es un recordatorio de que tu pago mensual para la clase <strong>"${className} ${getLevel(classLevel)}"</strong> vence el <strong>${details.dueDate}</strong>.</p>
      
      <div style="background-color: ${details.urgent ? '#fff5f5' : '#ebf8ff'}; padding: 15px; border-radius: 5px; margin: 20px 0; ${details.urgent ? 'border-left: 4px solid #e53e3e;' : ''}">
        <h3 style="color: ${details.urgent ? '#e53e3e' : '#3182ce'}; margin-top: 0;">Detalles del pago:</h3>
        <ul style="padding-left: 20px;">
          <li><strong>Monto:</strong> ${details.amount} ${details.currency}</li>
          <li><strong>Fecha límite:</strong> ${details.dueDate}</li>
          ${details.urgent ? '<li style="color: #e53e3e; font-weight: bold;">¡URGENTE! Tu pago vence mañana.</li>' : ''}
        </ul>
      </div>
      
      <p>Para realizar el pago, ingresa a tu cuenta de ClassNet y sube tu comprobante de pago en la sección de "Mis Inscripciones".</p>
      
      <p>Si ya realizaste el pago, por favor ignora este mensaje.</p>
      
      <p style="margin-top: 30px;">
        Saludos,<br>
        El equipo de ClassNet
      </p>
    </div>
  `;

  return await sendEmail(studentEmail, subject, textContent, htmlContent);
}

/**
 * Envía una notificación de pago vencido a un estudiante
 */
export async function sendPaymentOverdueEmail(
  studentEmail: string,
  studentName: string,
  className: string,
  classLevel: string,
  details: {
    dueDate: string;
    amount: number;
    currency: string;
    gracePeriod: number;
  }
) {
  const subject = 'IMPORTANTE: Pago vencido - ClassNet';

  const textContent = `
    Hola ${studentName},
    
    Notamos que tu pago mensual para la clase "${className} ${getLevel(classLevel)}" está vencido desde el ${details.dueDate}.
    
    Detalles del pago:
    - Monto: ${details.amount} ${details.currency}
    - Fecha de vencimiento: ${details.dueDate}
    - Período de gracia: ${details.gracePeriod} días
    
    Es importante que regularices tu situación lo antes posible para evitar la suspensión de tu acceso a la clase.
    Si no realizas el pago dentro del período de gracia, tu inscripción será suspendida temporalmente.
    
    Para realizar el pago, ingresa a tu cuenta de ClassNet y sube tu comprobante de pago en la sección de "Mis Inscripciones".
    
    Si ya realizaste el pago o crees que esto es un error, por favor contáctanos inmediatamente.
    
    Saludos,
    El equipo de ClassNet
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">IMPORTANTE: Pago Vencido</h2>
      <p>Hola <strong>${studentName}</strong>,</p>
      <p>Notamos que tu pago mensual para la clase <strong>"${className} ${getLevel(classLevel)}"</strong> está vencido desde el <strong>${details.dueDate}</strong>.</p>
      
      <div style="background-color: #fff5f5; padding: 15px; border-left: 4px solid #e53e3e; margin: 20px 0;">
        <h3 style="color: #e53e3e; margin-top: 0;">Detalles del pago:</h3>
        <ul style="padding-left: 20px;">
          <li><strong>Monto:</strong> ${details.amount} ${details.currency}</li>
          <li><strong>Fecha de vencimiento:</strong> ${details.dueDate}</li>
          <li><strong>Período de gracia:</strong> ${details.gracePeriod} días</li>
        </ul>
      </div>
      
      <p><strong>Es importante que regularices tu situación lo antes posible para evitar la suspensión de tu acceso a la clase.</strong></p>
      <p>Si no realizas el pago dentro del período de gracia, tu inscripción será suspendida temporalmente.</p>
      
      <p>Para realizar el pago, ingresa a tu cuenta de ClassNet y sube tu comprobante de pago en la sección de "Mis Inscripciones".</p>
      
      <p>Si ya realizaste el pago o crees que esto es un error, por favor contáctanos inmediatamente.</p>
      
      <p style="margin-top: 30px;">
        Saludos,<br>
        El equipo de ClassNet
      </p>
    </div>
  `;

  return await sendEmail(studentEmail, subject, textContent, htmlContent);
}

/**
 * Envía una confirmación de pago mensual a un estudiante
 */
export async function sendPaymentConfirmationEmail(
  studentEmail: string,
  studentName: string,
  className: string,
  classLevel: string,
  details: {
    paymentDate: string;
    nextPaymentDate: string;
    amount: number;
    currency: string;
  }
) {
  const subject = 'Confirmación de pago mensual - ClassNet';

  const textContent = `
    Hola ${studentName},
    
    ¡Buenas noticias! Tu pago mensual para la clase "${className} ${getLevel(classLevel)}" ha sido confirmado.
    
    Detalles del pago:
    - Monto: ${details.amount} ${details.currency}
    - Fecha de pago: ${details.paymentDate}
    - Próximo pago: ${details.nextPaymentDate}
    
    Tu inscripción sigue activa y puedes continuar disfrutando de tu clase sin interrupciones.
    
    Recuerda que el próximo pago deberá realizarse antes del ${details.nextPaymentDate}. Te enviaremos recordatorios con anticipación.
    
    ¡Gracias por tu puntualidad!
    
    Saludos,
    El equipo de ClassNet
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #38a169;">Confirmación de Pago Mensual</h2>
      <p>Hola <strong>${studentName}</strong>,</p>
      <p>¡Buenas noticias! Tu pago mensual para la clase <strong>"${className} ${getLevel(classLevel)}"</strong> ha sido confirmado.</p>
      
      <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #38a169; margin-top: 0;">Detalles del pago:</h3>
        <ul style="padding-left: 20px;">
          <li><strong>Monto:</strong> ${details.amount} ${details.currency}</li>
          <li><strong>Fecha de pago:</strong> ${details.paymentDate}</li>
          <li><strong>Próximo pago:</strong> ${details.nextPaymentDate}</li>
        </ul>
      </div>
      
      <p>Tu inscripción sigue activa y puedes continuar disfrutando de tu clase sin interrupciones.</p>
      
      <p>Recuerda que el próximo pago deberá realizarse antes del <strong>${details.nextPaymentDate}</strong>. Te enviaremos recordatorios con anticipación.</p>
      
      <p>¡Gracias por tu puntualidad!</p>
      
      <p style="margin-top: 30px;">
        Saludos,<br>
        El equipo de ClassNet
      </p>
    </div>
  `;

  return await sendEmail(studentEmail, subject, textContent, htmlContent);
}