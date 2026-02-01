
export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  QUALIFIED = 'Qualified',
  CONVERTED = 'Converted',
  NOT_INTERESTED = 'Not Interested',
  LOST = 'Lost'
}

export enum LeadSource {
  WEBSITE = 'Website',
  REFERRAL = 'Referral',
  COLD_CALL = 'Cold Call',
  SOCIAL_MEDIA = 'Social Media',
  WALK_IN = 'Walk-in',
  OTHER = 'Other'
}

export type LeadPriority = 'High' | 'Medium' | 'Low';
export type LoyaltyStatus = 'VIP' | 'Active' | 'Inactive' | 'New';
export type Language = 'en' | 'hi';
export type UserRole = 'Owner' | 'Manager' | 'Sales';

export interface User {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  password?: string; // For demo purposes
}

export enum DealStage {
  DISCOVERY = 'Discovery',
  PROPOSAL = 'Proposal Sent',
  NEGOTIATION = 'Negotiation',
  CLOSING = 'Closing',
  WON = 'Won',
  LOST = 'Lost'
}

export type ActivityType = 'Call' | 'Email' | 'WhatsApp' | 'Meeting' | 'Note' | 'Task' | 'File' | 'StatusChange' | 'Assignment' | 'DealEvent' | 'Created';

export interface NoteAnalysis {
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  topics: string[];
  actionItems: string[];
}

export interface CRMActivity {
  id: string;
  entityId: string;
  entityType: 'Lead' | 'Customer' | 'Deal';
  type: ActivityType;
  content: string;
  timestamp: string;
  user: string;
  userId: string;
  isPrivate?: boolean;
  isVoice?: boolean;
  duration?: string;
  outcome?: string;
  location?: string;
  attendees?: string[];
  taskStatus?: 'Completed' | 'In Progress' | 'Cancelled';
  fileName?: string;
  oldValue?: string;
  newValue?: string;
  subject?: string;
  to?: string;
  aiAnalysis?: NoteAnalysis;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ip?: string;
}

export interface EmailTemplate {
  id: string;
  title: string;
  subject: string;
  body: string;
  category: 'Sales' | 'Service' | 'Internal';
}

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface CRMTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: TaskPriority;
  isCompleted: boolean;
  assignedTo: string;
  assignedToId: string;
  relatedTo?: { id: string; type: 'Lead' | 'Customer' | 'Deal'; name: string };
  createdAt: string;
}

export type CalendarEventType = 'Meeting' | 'Follow-up' | 'Reminder' | 'Holiday' | 'Task';

export interface CRMEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  location?: string;
  description?: string;
  relatedTo?: { id: string; type: 'Lead' | 'Customer' | 'Deal'; name: string };
  reminderMinutes?: number;
  userId: string;
}

export interface LeadAiMetadata {
  score?: number;
  scoreLabel?: 'Hot' | 'Warm' | 'Cold';
  summary?: string;
  industry?: string;
  companySize?: string;
  website?: string;
}

export interface Customer {
  id: string;
  leadId?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  customerSince: string;
  loyaltyStatus: LoyaltyStatus;
  totalRevenue: number;
  activeDealsCount: number;
  preferredLanguage: 'English' | 'Hindi';
  preferredContactTime: string;
  tags: string[];
  avatar?: string;
  lastPurchaseDate?: string;
  subscriptionRenewal?: string;
  paymentStatus?: 'Paid' | 'Pending' | 'Overdue';
  lastWhatsAppSent?: string;
  assignedToId: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  source: string; // Changed from LeadSource enum to string to support custom sources
  priority: LeadPriority;
  value: number;
  city: string;
  notes: string;
  lastContact: string;
  createdAt: string;
  activities: LeadActivity[];
  assignedTo?: string;
  assignedToId: string;
  aiMetadata?: LeadAiMetadata;
  lastWhatsAppSent?: string;
}

export interface LeadActivity {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  user: string;
  isVoice?: boolean;
  aiAnalysis?: NoteAnalysis;
}

export interface Deal {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  value: number;
  stage: string; // Changed from DealStage enum to string to support custom stages
  priority: 'High' | 'Medium' | 'Low';
  probability: number;
  expectedClose: string;
  actualClose?: string;
  assignedTo: string;
  assignedToId: string;
  products: DealProduct[];
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealProduct {
  name: string;
  quantity: number;
  price: number;
}

export type NotificationType = 'System' | 'Lead' | 'Deal' | 'Reminder' | 'Activity' | 'Milestone' | 'Task' | 'Security';

export interface CRMNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  link?: { tab: string; id: string };
}

export interface Reminder {
  id: string;
  leadId?: string;
  dealId?: string;
  title: string;
  dueDate: string;
  notes: string;
  isCompleted: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  leadAssignments: boolean;
  dealUpdates: boolean;
  dailyDigest: boolean;
  frequency: 'Real-time' | 'Hourly' | 'Daily';
}

export interface UserProfile {
  name: string;
  phone: string;
}

export interface BusinessInfo {
  name: string;
  type: string;
  address: string;
}

export interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  leads: Lead[];
  customers: Customer[];
  deals: Deal[];
  activities: CRMActivity[];
  notifications: CRMNotification[];
  reminders: Reminder[];
  tasks: CRMTask[];
  events: CRMEvent[];
  auditLogs: AuditLog[];
  notificationSettings: NotificationSettings;
  userProfile: UserProfile;
  users: User[];
  businessInfo: BusinessInfo;
  leadSources: string[];
  dealStages: string[];
  dealStages: string[];
  persist: (key: string, data: any) => void;
  // Core Actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'activities'>) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  deleteLead: (id: string) => void;
  convertLeadToCustomer: (leadId: string) => void;
  updateLeadAiMetadata: (id: string, metadata: Partial<LeadAiMetadata>) => void;
  addLeadActivity: (leadId: string, activity: Omit<LeadActivity, 'id' | 'timestamp'>, aiAnalysis?: NoteAnalysis) => void;
  logWhatsAppSent: (id: string, isLead: boolean, content: string) => void;
  bulkDeleteLeads: (ids: string[]) => void;
  bulkUpdateLeadStatus: (ids: string[], status: LeadStatus) => void;
  bulkAssignLeads: (ids: string[], userId: string, userName: string) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeal: (id: string, deal: Partial<Deal>) => void;
  updateDealStage: (id: string, stage: string) => void;
  deleteDeal: (id: string) => void;
  // Activity Actions
  addActivity: (activity: Omit<CRMActivity, 'id' | 'timestamp' | 'user' | 'userId'>) => void;
  deleteActivity: (id: string) => void;
  // Notification Actions
  addNotification: (notification: Omit<CRMNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  // Reminder Actions
  addReminder: (reminder: Omit<Reminder, 'id' | 'isCompleted'>) => void;
  completeReminder: (id: string) => void;
  // Task Actions
  addTask: (task: Omit<CRMTask, 'id' | 'createdAt' | 'isCompleted'>) => void;
  updateTask: (id: string, task: Partial<CRMTask>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  // Event Actions
  addEvent: (event: Omit<CRMEvent, 'id' | 'userId'>) => void;
  updateEvent: (id: string, event: Partial<CRMEvent>) => void;
  deleteEvent: (id: string) => void;
  // Audit Actions
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName'>) => void;
  // Account & Settings Actions
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateBusinessInfo: (info: Partial<BusinessInfo>) => void;
  setLeadSources: (sources: string[]) => void;
  setDealStages: (stages: string[]) => void;
  deleteAccount: () => void;
  // User Actions
  addUser: (user: User) => void;
  updateUser: (email: string, updates: Partial<User>) => void;
  deleteUser: (email: string) => void;
}
