import nodemailer from 'nodemailer';
import { convert } from 'html-to-text';

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
 * Crea una plantilla de correo electrónico con el logo de ClassNet y un formato estándar
 * @param bodyContent Contenido HTML del cuerpo del correo
 * @param title Título del correo (opcional)
 * @returns String con el HTML completo del correo
 */
function createEmailTemplate(bodyContent: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ClassNet</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.8;
          color: #000;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          font-size: 16px;
        }
        .email-container {
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          padding: 30px;
          background-color: #fff;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .logo-container {
          text-align: center;
          margin-bottom: 25px;
        }
        .logo {
          font-size: 3rem;
          font-weight: bold;
          text-align: center;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          padding: 1rem;
          display: inline-block;
        }
        .content {
          margin-top: 20px;
          font-size: 17px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
          font-size: 1rem;
          color: #000;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="logo-container">
          <div class="logo">ClassNet</div>
        </div>
        <div class="content">
          ${bodyContent}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ClassNet. Todos los derechos reservados.</p>
          <p style="margin-top: 10px;">
            <strong>¿Necesitas ayuda?</strong><br>
            Correo: <a href="mailto:${process.env.FROM_EMAIL}" style="color: #3b82f6; text-decoration: none;">${process.env.FROM_EMAIL}</a><br>
            WhatsApp: <a href="https://wa.me/18298647008" style="color: #3b82f6; text-decoration: none;">829-864-7008</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Convierte HTML a texto plano para correos electrónicos
 * @param html Contenido HTML
 * @returns Texto plano equivalente
 */
function htmlToPlainText(html: string): string {
  return convert(html, {
    wordwrap: 80,
    preserveNewlines: true,
    selectors: [
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      { selector: 'img', format: 'skip' }
    ]
  });
}

/**
 * Envía un correo electrónico usando Nodemailer
 * @param to Dirección de correo del destinatario
 * @param subject Asunto del correo
 * @param htmlContent Contenido en HTML
 * @param textContent Contenido en texto plano (opcional, se genera automáticamente si no se proporciona)
 * @returns Promise que se resuelve cuando el correo es enviado
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string
) {
  // Extraer el título del asunto para usarlo en la plantilla
  const formattedHtmlContent = createEmailTemplate(htmlContent);
  
  // Generar texto plano a partir del HTML si no se proporciona
  const plainTextContent = textContent || htmlToPlainText(htmlContent);

  const mailOptions = {
    from: FROM_EMAIL,
    to,
    subject,
    text: plainTextContent,
    html: formattedHtmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
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
    price?: number;
    whatsappLink?: string;
  } = {}
) {
  const subject = '¡Inscripción Confirmada! - ClassNet';

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
      
      ${classDetails.whatsappLink ? `
      <div style="margin: 25px 0; padding: 15px; background-color: #f0fff4; border-left: 4px solid #48bb78; border-radius: 4px;">
        <h3 style="color: #2f855a; margin-top: 0;">¡Únete al grupo de WhatsApp de la clase!</h3>
        <p>Únete al grupo de WhatsApp haciendo clic en el siguiente enlace:</p>
        <p style="margin: 15px 0;">
          <a href="${classDetails.whatsappLink}" 
             style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Unirme al grupo de WhatsApp
          </a>
        </p>
        <p style="font-size: 12px; color: #718096; margin: 5px 0 0;">
          Si el botón no funciona, copia y pega este enlace en tu navegador: <br>
          <span style="word-break: break-all;">${classDetails.whatsappLink}</span>
        </p>
      </div>
      ` : ''}

      <p>Gracias por confiar en ClassNet para tu educación.</p>
      
      <p>Saludos,<br>El equipo de ClassNet</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096;">
        <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
      </div>
    </div>
  `;

  return sendEmail(studentEmail, subject, htmlContent);
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

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">Comprobante de Pago Rechazado</h2>
      <p>Hola <strong>${studentName}</strong>,</p>
      <p>Tu comprobante de pago para la clase <strong>"${className} ${getLevel(classLevel)}"</strong> ha sido rechazado.</p>
      
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

  return await sendEmail(studentEmail, subject, htmlContent);
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

  return await sendEmail(studentEmail, subject, htmlContent);
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

  return await sendEmail(studentEmail, subject, htmlContent);
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

  return await sendEmail(studentEmail, subject, htmlContent);
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
    paymentDueDate: string;
    nextPaymentDate: string;
    amount: number;
    currency: string;
  }
) {
  const subject = 'Confirmación de pago mensual - ClassNet';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #38a169;">Confirmación de Pago Mensual</h2>
      <p>Hola <strong>${studentName}</strong>,</p>
      <p>¡Buenas noticias! Tu pago mensual para la clase <strong>"${className} ${getLevel(classLevel)}"</strong> ha sido confirmado.</p>
      
      <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #38a169; margin-top: 0;">Detalles del pago:</h3>
        <ul style="padding-left: 20px;">
          <li><strong>Fecha de pago:</strong> ${details.paymentDate}</li>
          <li><strong>Monto:</strong> ${details.amount} ${details.currency}</li>
          <li><strong>Pago correspondiente a:</strong> ${details.paymentDueDate}</li>
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

  return await sendEmail(studentEmail, subject, htmlContent);
}

/**
 * Envía un correo de notificación cuando el período de prueba ha expirado
 * @param studentEmail Email del estudiante
 * @param studentName Nombre del estudiante
 * @param className Nombre de la clase
 * @param classLevel Nivel de la clase
 * @param expiryDate Fecha de expiración de la prueba
 */
export async function sendTrialExpiredEmail(
  studentEmail: string,
  studentName: string,
  className: string,
  classLevel: string,
  expiryDate: Date
) {
  const formattedDate = expiryDate.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">¡Período de Prueba Finalizado!</h2>
      <p>Hola <strong>${studentName}</strong>,</p>
      <p>Tu período de prueba para la clase <strong>${className} (${getLevel(classLevel)})</strong> ha finalizado.</p>
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #4a5568; margin-top: 0;">Detalles de la clase:</h3>
        <ul style="padding-left: 20px;">
          <li><strong>Clase:</strong> ${className}</li>
          <li><strong>Nivel:</strong> ${getLevel(classLevel)}</li>
          <li><strong>Fecha de finalización:</strong> ${formattedDate}</li>
        </ul>
      </div>
      
      <p>Para continuar disfrutando de la clase, te recomendamos realizar el pago correspondiente lo antes posible.</p>
      <p>Si ya realizaste el pago, por favor ignora este mensaje.</p>
    </div>
  `;

  return sendEmail(
    studentEmail,
    'Tu período de prueba ha finalizado',
    htmlContent
  );
}

/**
 * Envía un correo de notificación cuando el período de prueba está por expirar
 * @param studentEmail Email del estudiante
 * @param studentName Nombre del estudiante
 * @param className Nombre de la clase
 * @param classLevel Nivel de la clase
 * @param expiryDate Fecha de expiración de la prueba
 * @param daysLeft Días restantes para que expire la prueba
 */
export async function sendTrialExpiryNotificationEmail(
  studentEmail: string,
  studentName: string,
  className: string,
  classLevel: string,
  expiryDate: Date,
  daysLeft: number
) {
  const formattedDate = expiryDate.toLocaleDateString('es-ES', { 
    weekday: 'long',
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">¡Tu período de prueba está por finalizar!</h2>
      <p>Hola <strong>${studentName}</strong>,</p>
      <p>Te recordamos que tu período de prueba para la clase <strong>${className} (${getLevel(classLevel)})</strong> finaliza en <strong>${daysLeft} día${daysLeft > 1 ? 's' : ''}</strong>.</p>
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #4a5568; margin-top: 0;">Detalles de la clase:</h3>
        <ul style="padding-left: 20px;">
          <li><strong>Clase:</strong> ${className}</li>
          <li><strong>Nivel:</strong> ${getLevel(classLevel)}</li>
          <li><strong>Fecha de finalización:</strong> ${formattedDate}</li>
        </ul>
      </div>
      
      <p>Para continuar disfrutando de la clase después de esta fecha, te recomendamos realizar el pago correspondiente.</p>
      <p>¡No pierdas tu acceso a la plataforma de aprendizaje!</p>
      
      <div style="margin-top: 20px; padding: 15px; background-color: #ebf8ff; border-radius: 5px; border-left: 4px solid #4299e1;">
        <p style="margin: 0; color: #2c5282;">
          <strong>¿Necesitas ayuda con tu pago?</strong><br>
          Contáctanos en <a href="mailto:${process.env.FROM_EMAIL}" style="color: #2b6cb0; text-decoration: none;">${process.env.FROM_EMAIL}</a> o por WhatsApp al <a href="https://wa.me/18298647008" style="color: #2b6cb0; text-decoration: none;">829-864-7008</a>
        </p>
      </div>
    </div>
  `;

  return sendEmail(
    studentEmail,
    `Tu período de prueba finaliza en ${daysLeft} día${daysLeft > 1 ? 's' : ''}`,
    htmlContent
  );
}

export async function sendVerificationEmail(email: string, token: string) {
  const subject = 'Verificación de correo electrónico - ClassNet';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #38a169;">Verificación de correo electrónico</h2>
      <p>Hola,</p>
      <p>Para verificar tu correo electrónico, haz clic en el siguiente enlace:</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}">Verificar correo electrónico</a></p>
    </div>
  `;
  return await sendEmail(email, subject, htmlContent);
}