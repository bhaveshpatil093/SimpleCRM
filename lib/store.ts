
import { create } from 'zustand';
import { AppState, Lead, Customer, Deal, LeadStatus, DealStage, LeadSource, LeadActivity, NoteAnalysis, Language, CRMNotification, Reminder, NotificationSettings, CRMActivity, ActivityType, CRMTask, CRMEvent, AuditLog, UserProfile, BusinessInfo, User } from '../types';

const getSaved = <T>(key: string, fallback: T): T => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null || saved === 'undefined') return fallback;
      return JSON.parse(saved);
    } catch (e) {
      console.warn(`Error loading ${key} from storage:`, e);
      return fallback;
    }
  }
  return fallback;
};

const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('crm_session');
    if (!session || session === 'undefined') return null;
    try {
      return JSON.parse(session);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const useCRMStore = create<AppState>((set, get) => ({
  language: getSaved('crm_lang', 'en'),
  setLanguage: (lang: Language) => {
    localStorage.setItem('crm_lang', lang);
    set({ language: lang });
  },

  userProfile: getSaved('crm_profile', { name: 'Rajesh Iyer', phone: '+91 98765 43210' }),
  users: getSaved('crm_users', [
    {
      email: 'owner@business.com',
      password: 'password123',
      name: 'Rajesh Iyer',
      role: 'Owner' as const,
      avatar: 'https://i.pravatar.cc/150?u=rajesh'
    },
    {
      email: 'manager@business.com',
      password: 'password123',
      name: 'Sonal Verma',
      role: 'Manager' as const,
      avatar: 'https://i.pravatar.cc/150?u=sonal'
    },
    {
      email: 'sales@business.com',
      password: 'password123',
      name: 'Amit Sharma',
      role: 'Sales' as const,
      avatar: 'https://i.pravatar.cc/150?u=amit'
    }
  ] as User[]),
  businessInfo: getSaved('crm_business', {
    name: 'My Business Pvt Ltd',
    type: 'Services',
    address: '123, Tech Park, Hitech City, Hyderabad, 500081'
  }),

  leadSources: getSaved('crm_lead_sources', Object.values(LeadSource)),
  dealStages: getSaved('crm_deal_stages', Object.values(DealStage)),

  leads: getSaved('crm_leads', [
    {
      id: '1',
      name: 'Arjun Mehta',
      email: 'arjun@techindia.com',
      phone: '+91 98765 43210',
      company: 'Tech India Solutions',
      status: LeadStatus.NEW,
      source: 'Website',
      priority: 'High',
      value: 50000,
      city: 'Mumbai',
      notes: 'Interested in enterprise license.',
      lastContact: '2023-10-25T10:00:00Z',
      createdAt: '2023-10-20T09:00:00Z',
      assignedTo: 'Rajesh Iyer',
      assignedToId: 'owner@business.com',
      aiMetadata: { score: 85, scoreLabel: 'Hot' },
      activities: []
    }
  ]),

  customers: getSaved('crm_customers', [
    {
      id: 'cust-1',
      name: 'Sunil Kumar',
      email: 'sunil@globalcorp.com',
      phone: '+91 91234 56789',
      company: 'Global Corp',
      city: 'Delhi',
      customerSince: '2023-01-15T10:00:00Z',
      loyaltyStatus: 'VIP',
      totalRevenue: 450000,
      activeDealsCount: 1,
      preferredLanguage: 'English',
      preferredContactTime: '10 AM - 12 PM',
      tags: ['VIP', 'Cloud Focused'],
      avatar: 'https://i.pravatar.cc/150?u=sunil',
      lastPurchaseDate: '2023-09-20T14:00:00Z',
      subscriptionRenewal: '2024-09-20T14:00:00Z',
      paymentStatus: 'Paid',
      assignedToId: 'owner@business.com'
    },
    {
      id: 'cust-2',
      name: 'Priyanka Rao',
      email: 'priyanka@techsavylabs.io',
      phone: '+91 88776 55443',
      company: 'Tech-Savy Labs',
      city: 'Bangalore',
      customerSince: '2023-05-10T09:00:00Z',
      loyaltyStatus: 'Active',
      totalRevenue: 280000,
      activeDealsCount: 2,
      preferredLanguage: 'English',
      preferredContactTime: '2 PM - 4 PM',
      tags: ['High Growth', 'SaaS'],
      avatar: 'https://i.pravatar.cc/150?u=priyanka',
      lastPurchaseDate: '2023-11-05T11:00:00Z',
      subscriptionRenewal: '2024-11-05T11:00:00Z',
      paymentStatus: 'Paid',
      assignedToId: 'owner@business.com'
    }
  ]),

  deals: getSaved('crm_deals', [
    {
      id: 'deal-1',
      title: 'Enterprise Cloud Migration',
      customerId: 'cust-1',
      customerName: 'Sunil Kumar',
      value: 300000,
      stage: 'Won',
      priority: 'High',
      probability: 100,
      expectedClose: '2023-12-15',
      actualClose: '2023-09-20',
      assignedTo: 'Sonal Verma',
      assignedToId: 'manager@business.com',
      products: [{ name: 'Cloud Server Setup', quantity: 1, price: 300000 }],
      createdAt: '2023-08-01T10:00:00Z',
      updatedAt: '2023-09-20T14:00:00Z'
    },
    {
      id: 'deal-2',
      title: 'Mobile App Redevelopment',
      customerId: 'cust-2',
      customerName: 'Priyanka Rao',
      value: 550000,
      stage: 'Discovery',
      priority: 'High',
      probability: 25,
      expectedClose: '2024-06-30',
      assignedTo: 'Rajesh Iyer',
      assignedToId: 'owner@business.com',
      products: [{ name: 'App Development', quantity: 1, price: 550000 }],
      createdAt: '2024-01-10T11:00:00Z',
      updatedAt: '2024-01-12T16:00:00Z'
    }
  ]),

  activities: getSaved('crm_activities', [
    {
      id: 'act-init-1',
      entityId: '1',
      entityType: 'Lead',
      type: 'Created',
      content: 'Lead created via Website',
      timestamp: '2023-10-20T09:00:00Z',
      user: 'System',
      userId: 'system'
    }
  ]),

  notifications: getSaved('crm_notifications', []),
  reminders: getSaved('crm_reminders', []),
  tasks: getSaved('crm_tasks', []),
  events: getSaved('crm_events', []),
  auditLogs: getSaved('crm_audit_logs', []),

  notificationSettings: getSaved('crm_notif_settings', {
    email: true,
    push: true,
    leadAssignments: true,
    dealUpdates: true,
    dailyDigest: false,
    frequency: 'Real-time'
  }),

  // Persistence Helper
  persist: (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  updateUserProfile: (profile) => set((state) => {
    const updated = { ...state.userProfile, ...profile };
    get().persist('crm_profile', updated);
    get().addAuditLog({ action: 'UPDATE_PROFILE', details: 'Updated personal profile settings' });
    return { userProfile: updated };
  }),

  updateBusinessInfo: (info) => set((state) => {
    const updated = { ...state.businessInfo, ...info };
    get().persist('crm_business', updated);
    get().addAuditLog({ action: 'UPDATE_BUSINESS', details: `Updated business info: ${updated.name}` });
    return { businessInfo: updated };
  }),

  setLeadSources: (sources) => set((state) => {
    get().persist('crm_lead_sources', sources);
    return { leadSources: sources };
  }),

  setDealStages: (stages) => set((state) => {
    get().persist('crm_deal_stages', stages);
    return { dealStages: stages };
  }),

  addAuditLog: (logData) => set((state) => {
    const user = getCurrentUser();
    if (!user) return state;
    const newLog: AuditLog = {
      ...logData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: user.email,
      userName: user.name
    };
    const updated = [newLog, ...state.auditLogs].slice(0, 500);
    get().persist('crm_audit_logs', updated);
    return { auditLogs: updated };
  }),

  addActivity: (activityData) => set((state) => {
    const user = getCurrentUser();
    const newActivity: CRMActivity = {
      ...activityData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      user: user?.name || 'System',
      userId: user?.email || 'system'
    };
    const updated = [newActivity, ...state.activities];
    get().persist('crm_activities', updated);
    return { activities: updated };
  }),

  deleteActivity: (id) => set((state) => {
    const user = getCurrentUser();
    const act = state.activities.find(a => a.id === id);
    if (user?.role !== 'Owner' && act?.userId !== user?.email) {
      alert("Permission Denied");
      return state;
    }
    const updated = state.activities.filter(a => a.id !== id);
    get().persist('crm_activities', updated);
    return { activities: updated };
  }),

  addLead: (lead) => set((state) => {
    const user = getCurrentUser();
    const newId = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...lead,
      id: newId,
      createdAt: now,
      lastContact: now,
      activities: [],
      assignedToId: lead.assignedToId || user?.email || 'owner@business.com'
    };
    const updated = [newLead, ...state.leads];
    get().persist('crm_leads', updated);
    get().addActivity({ entityId: newId, entityType: 'Lead', type: 'Created', content: `Lead created via ${lead.source}` });
    get().addNotification({ type: 'Lead', title: 'New Lead Added', description: `${newLead.name} from ${newLead.company} has been added.`, link: { tab: 'leads', id: newId } });
    get().addAuditLog({ action: 'CREATE_LEAD', details: `Added lead: ${newLead.name} (${newLead.company})` });
    return { leads: updated };
  }),

  updateLeadStatus: (id, status) => set((state) => {
    const lead = state.leads.find(l => l.id === id);
    if (lead) {
      get().addActivity({ entityId: id, entityType: 'Lead', type: 'StatusChange', content: `Status updated to ${status}`, oldValue: lead.status, newValue: status });
    }
    const updated = state.leads.map(l => l.id === id ? { ...l, status, lastContact: new Date().toISOString() } : l);
    get().persist('crm_leads', updated);
    return { leads: updated };
  }),

  deleteLead: (id) => set((state) => {
    const user = getCurrentUser();
    if (user?.role === 'Sales') return state;
    const updated = state.leads.filter(l => l.id !== id);
    get().persist('crm_leads', updated);
    return { leads: updated };
  }),

  convertLeadToCustomer: (leadId) => set((state) => {
    const lead = state.leads.find(l => l.id === leadId);
    if (!lead) return state;
    const newCustomerId = 'cust-' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      id: newCustomerId,
      leadId: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      city: lead.city,
      customerSince: now,
      loyaltyStatus: 'New',
      totalRevenue: lead.value,
      activeDealsCount: 0,
      preferredLanguage: 'English',
      preferredContactTime: '10 AM - 12 PM',
      tags: ['New Customer'],
      avatar: `https://i.pravatar.cc/150?u=${lead.id}`,
      assignedToId: lead.assignedToId
    };
    const updatedCustomers = [newCustomer, ...state.customers];
    const updatedLeads = state.leads.map(l => l.id === leadId ? { ...l, status: LeadStatus.CONVERTED } : l);
    get().persist('crm_customers', updatedCustomers);
    get().persist('crm_leads', updatedLeads);
    get().addActivity({ entityId: newCustomerId, entityType: 'Customer', type: 'Created', content: `Converted from lead: ${lead.name}` });
    get().addAuditLog({ action: 'CONVERT_LEAD', details: `Converted ${lead.name} to customer` });
    return { leads: updatedLeads, customers: updatedCustomers };
  }),

  updateLeadAiMetadata: (id, metadata) => set((state) => {
    const updated = state.leads.map(l => l.id === id ? { ...l, aiMetadata: { ...l.aiMetadata, ...metadata } } : l);
    get().persist('crm_leads', updated);
    return { leads: updated };
  }),

  addLeadActivity: (leadId, activityData, aiAnalysis) => {
    get().addActivity({ entityId: leadId, entityType: 'Lead', type: activityData.type as ActivityType, content: activityData.content, isVoice: activityData.isVoice, aiAnalysis });
  },

  logWhatsAppSent: (id, isLead, content) => {
    get().addActivity({ entityId: id, entityType: isLead ? 'Lead' : 'Customer', type: 'WhatsApp', content });
  },

  bulkDeleteLeads: (ids) => set((state) => {
    const updated = state.leads.filter(l => !ids.includes(l.id));
    get().persist('crm_leads', updated);
    return { leads: updated };
  }),

  bulkUpdateLeadStatus: (ids, status) => set((state) => {
    const updated = state.leads.map(l => ids.includes(l.id) ? { ...l, status, lastContact: new Date().toISOString() } : l);
    get().persist('crm_leads', updated);
    return { leads: updated };
  }),

  bulkAssignLeads: (ids, userId, userName) => set((state) => {
    const updated = state.leads.map(l => ids.includes(l.id) ? { ...l, assignedTo: userName, assignedToId: userId, lastContact: new Date().toISOString() } : l);
    get().persist('crm_leads', updated);
    return { leads: updated };
  }),

  addCustomer: (customer) => set((state) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const updated = [{ ...customer, id: newId }, ...state.customers];
    get().persist('crm_customers', updated);
    return { customers: updated };
  }),

  updateCustomer: (id, customerUpdate) => set((state) => {
    const updated = state.customers.map(c => c.id === id ? { ...c, ...customerUpdate } : c);
    get().persist('crm_customers', updated);
    return { customers: updated };
  }),

  addDeal: (deal) => set((state) => {
    const now = new Date().toISOString();
    const newId = Math.random().toString(36).substr(2, 9);
    const updated = [{ ...deal, id: newId, createdAt: now, updatedAt: now }, ...state.deals];
    get().persist('crm_deals', updated);
    return { deals: updated };
  }),

  updateDeal: (id, dealUpdate) => set((state) => {
    const updated = state.deals.map(d => d.id === id ? { ...d, ...dealUpdate, updatedAt: new Date().toISOString() } : d);
    get().persist('crm_deals', updated);
    return { deals: updated };
  }),

  updateDealStage: (id, stage) => set((state) => {
    const updated = state.deals.map(d => {
      if (d.id === id) {
        const update: Partial<Deal> = { stage, updatedAt: new Date().toISOString() };
        if (stage === 'Won') { update.actualClose = new Date().toISOString(); update.probability = 100; }
        else if (stage === 'Lost') { update.probability = 0; }
        return { ...d, ...update };
      }
      return d;
    });
    get().persist('crm_deals', updated);
    return { deals: updated };
  }),

  deleteDeal: (id) => set((state) => {
    const updated = state.deals.filter(d => d.id !== id);
    get().persist('crm_deals', updated);
    return { deals: updated };
  }),

  addNotification: (n) => set((state) => {
    const notification = { ...n, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), isRead: false };
    const updated = [notification, ...state.notifications].slice(0, 50);
    get().persist('crm_notifications', updated);
    return { notifications: updated };
  }),

  markNotificationAsRead: (id) => set((state) => {
    const updated = state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    get().persist('crm_notifications', updated);
    return { notifications: updated };
  }),

  markAllNotificationsAsRead: () => set((state) => {
    const updated = state.notifications.map(n => ({ ...n, isRead: true }));
    get().persist('crm_notifications', updated);
    return { notifications: updated };
  }),

  deleteNotification: (id) => set((state) => {
    const updated = state.notifications.filter(n => n.id !== id);
    get().persist('crm_notifications', updated);
    return { notifications: updated };
  }),

  updateNotificationSettings: (settings) => set((state) => {
    const updated = { ...state.notificationSettings, ...settings };
    get().persist('crm_notif_settings', updated);
    return { notificationSettings: updated };
  }),

  addReminder: (r) => set((state) => {
    const reminder = { ...r, id: Math.random().toString(36).substr(2, 9), isCompleted: false };
    const updated = [reminder, ...state.reminders];
    get().persist('crm_reminders', updated);
    return { reminders: updated };
  }),

  completeReminder: (id) => set((state) => {
    const updated = state.reminders.map(r => r.id === id ? { ...r, isCompleted: true } : r);
    get().persist('crm_reminders', updated);
    return { reminders: updated };
  }),

  addTask: (task) => set((state) => {
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), isCompleted: false };
    const updated = [newTask, ...state.tasks];
    get().persist('crm_tasks', updated);
    return { tasks: updated };
  }),

  updateTask: (id, taskUpdate) => set((state) => {
    const updated = state.tasks.map(t => t.id === id ? { ...t, ...taskUpdate } : t);
    get().persist('crm_tasks', updated);
    return { tasks: updated };
  }),

  deleteTask: (id) => set((state) => {
    const updated = state.tasks.filter(t => t.id !== id);
    get().persist('crm_tasks', updated);
    return { tasks: updated };
  }),

  toggleTask: (id) => set((state) => {
    const updated = state.tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t);
    get().persist('crm_tasks', updated);
    return { tasks: updated };
  }),

  addEvent: (event) => set((state) => {
    const user = getCurrentUser();
    const newEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.email || 'system'
    };
    const updated = [newEvent, ...state.events];
    get().persist('crm_events', updated);
    return { events: updated };
  }),

  updateEvent: (id, eventUpdate) => set((state) => {
    const updated = state.events.map(e => e.id === id ? { ...e, ...eventUpdate } : e);
    get().persist('crm_events', updated);
    return { events: updated };
  }),

  deleteEvent: (id) => set((state) => {
    const updated = state.events.filter(e => e.id !== id);
    get().persist('crm_events', updated);
    return { events: updated };
  }),

  addUser: (user) => set((state) => {
    const updated = [...state.users, user];
    get().persist('crm_users', updated);
    return { users: updated };
  }),

  updateUser: (email, updates) => set((state) => {
    const updated = state.users.map(u => u.email === email ? { ...u, ...updates } : u);
    get().persist('crm_users', updated);
    // Also update current session if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email === email) {
      localStorage.setItem('crm_session', JSON.stringify({ ...currentUser, ...updates }));
    }
    return { users: updated };
  }),

  deleteUser: (email) => set((state) => {
    const updated = state.users.filter(u => u.email !== email);
    get().persist('crm_users', updated);
    return { users: updated };
  }),

  deleteAccount: () => {
    localStorage.clear();
    window.location.reload();
  }
}));
