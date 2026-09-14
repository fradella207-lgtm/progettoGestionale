import { db, doc, setDoc, auth } from '../firebase';

export interface AppFeedbackData {
  id?: string;
  type: 'improvement' | 'bug' | 'feature' | 'other';
  subject: string;
  message: string;
  senderName?: string;
  senderEmail?: string;
  deviceInfo?: string;
  appVersion?: string;
  createdAt?: string;
}

export const OWNER_EMAIL = 'my360garage@gmail.com';

/**
 * Submit feedback directly to Firestore app_feedback collection
 */
export async function submitAppFeedback(feedback: AppFeedbackData): Promise<{ success: boolean; id: string }> {
  const id = 'FB-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const now = new Date().toISOString();

  const payload = {
    id,
    type: feedback.type || 'improvement',
    subject: feedback.subject.trim(),
    message: feedback.message.trim(),
    senderName: feedback.senderName?.trim() || 'Utente My360Garage',
    senderEmail: feedback.senderEmail?.trim() || '',
    deviceInfo: `${navigator.userAgent || 'Unknown Device'} | Screen: ${window.innerWidth}x${window.innerHeight}`,
    appVersion: '2.5.0 (My360Garage)',
    createdAt: now,
    status: 'new',
    userId: auth.currentUser?.uid || 'anonymous'
  };

  // 1. Try to write to Firestore
  try {
    const feedbackDocRef = doc(db, 'app_feedback', id);
    await setDoc(feedbackDocRef, payload);
  } catch (err) {
    console.warn('Firestore feedback write warning (will use localStorage/mailto fallback):', err);
  }

  // 2. Also keep in local history
  try {
    const stored = JSON.parse(localStorage.getItem('my360garage_sent_feedbacks') || '[]');
    stored.unshift(payload);
    localStorage.setItem('my360garage_sent_feedbacks', JSON.stringify(stored.slice(0, 10)));
  } catch {}

  return { success: true, id };
}

/**
 * Generate mailto link formatted for the owner email
 */
export function buildOwnerMailtoLink(feedback: AppFeedbackData): string {
  const typeLabels: Record<string, string> = {
    improvement: 'Miglioramento / Suggerimento',
    bug: 'Segnalazione Errore / Bug',
    feature: 'Nuova Funzionalità',
    other: 'Altro / Feedback Generale'
  };

  const subject = `[My360Garage Feedback] ${typeLabels[feedback.type] || 'Segnalazione'}: ${feedback.subject || 'Miglioramento applicazione'}`;
  
  const body = `Ciao Francesco,\n\nTi invio questa segnalazione per migliorare l'applicazione My360Garage:\n\n` +
    `--------------------------------------------------\n` +
    `📌 TIPOLOGIA: ${typeLabels[feedback.type] || feedback.type}\n` +
    `📝 OGGETTO: ${feedback.subject}\n` +
    `👤 MITTENTE: ${feedback.senderName || 'Utente My360Garage'} (${feedback.senderEmail || 'Nessuna email indicata'})\n` +
    `--------------------------------------------------\n\n` +
    `💬 DETTAGLI & DESCRIZIONE:\n${feedback.message}\n\n` +
    `--------------------------------------------------\n` +
    `📱 INFO SISTEMA:\n` +
    `- Dispositivo: ${navigator.userAgent}\n` +
    `- Schermo: ${window.innerWidth}x${window.innerHeight}\n` +
    `- Data: ${new Date().toLocaleString('it-IT')}\n` +
    `- Versione App: 2.5.0\n`;

  return `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
