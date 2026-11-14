import nodemailer from "nodemailer";
import auditLogModel from "../models/auditLogModel.js";

// Helper for Email notifications using real Nodemailer
const getEmailTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const getEmailBrandHeader = () => {
    const publicAppUrl = process.env.PUBLIC_APP_URL?.replace(/\/+$/, '');
    return publicAppUrl
        ? `<img src="${publicAppUrl}/brand/logo-email.png" alt="PrayashCare" width="260" style="display:block;max-width:100%;height:auto;margin-bottom:20px;">`
        : '<h2 style="color:#3978e8;margin:0 0 20px;">PrayashCare</h2>';
};

export const sendEmailNotification = async ({ to, subject, htmlText, text }) => {
    try {
        const transporter = getEmailTransporter();
        if (!transporter) {
            console.log(`[Email Service] Skipped: EMAIL_USER or EMAIL_PASS not configured. (To: ${to}, Subject: ${subject})`);
            return { delivered: false, reason: "SMTP credentials not configured" };
        }

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"PrayashCare" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text: text || subject,
            html: htmlText
        });

        console.log(`[Email Service] Sent successfully to ${to}, MessageId: ${info.messageId}`);
        await auditLogModel.create({
            action: "EMAIL_SENT",
            targetType: "Notification",
            details: { to, subject, messageId: info.messageId }
        });

        return { delivered: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[Email Service Error]:`, error.message);
        return { delivered: false, error: error.message };
    }
};

// Helper for WhatsApp notifications using Meta WhatsApp Cloud API or Twilio
export const sendWhatsAppNotification = async ({ to, message }) => {
    try {
        // Option A: Meta WhatsApp Cloud API
        if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
            const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
            const cleanPhone = to.replace(/[^0-9]/g, '');
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: cleanPhone,
                    type: "text",
                    text: { body: message }
                })
            });
            const data = await response.json();
            if (response.ok) {
                console.log(`[WhatsApp Service] Meta API delivered message to ${to}`);
                return { delivered: true, data };
            } else {
                console.error(`[WhatsApp Service] Meta API error:`, data);
                return { delivered: false, error: data };
            }
        }

        // Option B: Twilio WhatsApp
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            const authHeader = 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
            const cleanPhone = to.startsWith('+') ? to : `+91${to.replace(/[^0-9]/g, '')}`;
            const params = new URLSearchParams();
            params.append('From', `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`);
            params.append('To', `whatsapp:${cleanPhone}`);
            params.append('Body', message);

            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });
            const data = await response.json();
            if (response.ok) {
                console.log(`[WhatsApp Service] Twilio API delivered message to ${cleanPhone}`);
                return { delivered: true, sid: data.sid };
            } else {
                console.error(`[WhatsApp Service] Twilio error:`, data);
                return { delivered: false, error: data };
            }
        }

        console.log(`[WhatsApp Service] Skipped: WHATSAPP_TOKEN or TWILIO credentials not configured. (To: ${to}, Message: ${message})`);
        return { delivered: false, reason: "WhatsApp API credentials not configured in environment" };
    } catch (error) {
        console.error(`[WhatsApp Service Error]:`, error.message);
        return { delivered: false, error: error.message };
    }
};

// Helper for SMS notifications
export const sendSMSNotification = async ({ to, message }) => {
    try {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            const authHeader = 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
            const cleanPhone = to.startsWith('+') ? to : `+91${to.replace(/[^0-9]/g, '')}`;
            const params = new URLSearchParams();
            params.append('From', process.env.TWILIO_PHONE_NUMBER);
            params.append('To', cleanPhone);
            params.append('Body', message);

            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });
            const data = await response.json();
            return response.ok ? { delivered: true, sid: data.sid } : { delivered: false, error: data };
        }

        console.log(`[SMS Service] Skipped: SMS gateway credentials not configured. (To: ${to})`);
        return { delivered: false, reason: "SMS credentials not configured in environment" };
    } catch (error) {
        console.error(`[SMS Service Error]:`, error.message);
        return { delivered: false, error: error.message };
    }
};

// Convenience helpers
export const notifyAppointmentBooked = async (appointment, user, doctor) => {
    const formattedDate = appointment.slotDate.replace(/_/g, '/');
    const msg = `Hello ${user.name}, your appointment with Dr. ${doctor.name} (${doctor.speciality}) is confirmed for ${formattedDate} at ${appointment.slotTime} at ${appointment.branchName || 'PrayashCare Hospital'}. Token #${appointment.queueToken || 1}.`;
    const emailBrandHeader = getEmailBrandHeader();
    
    if (user.phone) {
        await sendWhatsAppNotification({ to: user.phone, message: msg });
        await sendSMSNotification({ to: user.phone, message: msg });
    }
    if (user.email) {
        await sendEmailNotification({
            to: user.email,
            subject: `Appointment Confirmed - Dr. ${doctor.name} on ${formattedDate}`,
            htmlText: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                ${emailBrandHeader}
                <p>Dear <strong>${user.name}</strong>,</p>
                <p>Your appointment has been successfully scheduled:</p>
                <ul>
                    <li><strong>Doctor:</strong> Dr. ${doctor.name} (${doctor.speciality})</li>
                    <li><strong>Date & Time:</strong> ${formattedDate} at ${appointment.slotTime}</li>
                    <li><strong>Location:</strong> ${appointment.branchName || 'PrayashCare Hospital'}</li>
                    <li><strong>Token Number:</strong> #${appointment.queueToken || 1}</li>
                    <li><strong>Mode:</strong> ${appointment.type === 'telemedicine' ? 'Online Video Consultation' : 'In-Person Visit'}</li>
                </ul>
                <p>Please arrive 10 minutes early. Thank you for choosing PrayashCare!</p>
            </div>`
        });
    }
};

export const notifyAppointmentReminder = async (appointment, user, doctor) => {
    const msg = `Reminder: Dear ${user.name}, you have an appointment with Dr. ${doctor.name} today at ${appointment.slotTime}. Please be available on time.`;
    if (user.phone) await sendWhatsAppNotification({ to: user.phone, message: msg });
};

export const notifyLabReportReady = async (labReport, user) => {
    const msg = `Dear ${user.name}, your laboratory report for "${labReport.testName}" is now ready and available in your PrayashCare patient portal.`;
    if (user.phone) await sendWhatsAppNotification({ to: user.phone, message: msg });
    if (user.email) {
        await sendEmailNotification({
            to: user.email,
            subject: `Lab Report Ready: ${labReport.testName}`,
            htmlText: `<div style="font-family: Arial, sans-serif; padding: 20px;">${getEmailBrandHeader()}<p>Dear ${user.name},</p><p>Your test results for <strong>${labReport.testName}</strong> have been processed. Please log in to your patient dashboard to download your report.</p></div>`
        });
    }
};
