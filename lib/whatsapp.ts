
export interface WhatsAppTemplate {
  id: string;
  category: 'Greeting' | 'Follow-up' | 'Quote' | 'Thank You' | 'Festival' | 'Payment';
  title: string;
  content: string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'greet-1',
    category: 'Greeting',
    title: 'New Lead Introduction',
    content: "Namaste {name}, this is {your_name} from {company}. We received your inquiry regarding our services. How can I help you today?"
  },
  {
    id: 'fup-1',
    category: 'Follow-up',
    title: 'Post-Call Follow-up',
    content: "Hi {name}, it was great speaking with you earlier! As discussed, I've noted down your requirements for {company}. Looking forward to our next steps."
  },
  {
    id: 'fup-2',
    category: 'Follow-up',
    title: 'Gentle Reminder',
    content: "Hi {name}, just checking if you had a chance to look at the proposal we sent for {company}? Let me know if you have any questions."
  },
  {
    id: 'quote-1',
    category: 'Quote',
    title: 'Quote Ready',
    content: "Hi {name}, your customized quote for ₹{value} is ready! Please let me know a good time to walk you through the details."
  },
  {
    id: 'festival-diwali',
    category: 'Festival',
    title: 'Diwali Wishes',
    content: "Wishing you and your family at {company} a very Happy and Prosperous Diwali! 🪔 May this year bring abundance and joy to your business."
  },
  {
    id: 'festival-holi',
    category: 'Festival',
    title: 'Holi Wishes',
    content: "Happy Holi to you and the team at {company}! 🎨 May your year be as vibrant and colorful as this festival."
  },
  {
    id: 'payment-1',
    category: 'Payment',
    title: 'Payment Request',
    content: "Hi {name}, requesting payment of ₹{value} for the recent services provided to {company}. Please let us know once processed. Thank you!"
  },
  {
    id: 'hours-1',
    category: 'Greeting',
    title: 'Business Hours',
    content: "Hello! We are currently away. Our team is available 10 AM - 7 PM IST, Monday to Friday. We will get back to you shortly!"
  }
];

interface SubstituteParams {
  name: string;
  company: string;
  your_name: string;
  value?: string | number;
}

export function substituteTemplate(content: string, params: SubstituteParams): string {
  return content
    .replace(/{name}/g, params.name)
    .replace(/{company}/g, params.company)
    .replace(/{your_name}/g, params.your_name)
    .replace(/{value}/g, params.value?.toString() || '0');
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  // Indian numbers check - add 91 if not present and length is 10
  const formattedPhone = (cleanPhone.length === 10) ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
