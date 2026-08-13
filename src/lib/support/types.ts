export type SupportRole = 'BRAND' | 'CREATOR';

export interface SupportIssue {
  id: string;
  title: string;
  slug: string;
  description?: string;
  keywords: string[];
  solution?: string;
  actionType?: string;
  actionUrl?: string;
  requiresAdmin: boolean;
  priority: string;
  caseType: string;
}

export interface SupportSubcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  issues: SupportIssue[];
}

export interface SupportCategory {
  id: string;
  role: SupportRole;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  subcategories: SupportSubcategory[];
}

export interface SupportSearchResult {
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  categoryId: string;
  subcategoryName: string;
  solution?: string;
  requiresAdmin: boolean;
}

export interface SupportCase {
  id: string;
  caseNumber: string;
  userId: string;
  userRole: string;
  userName?: string;
  userEmail?: string;
  categoryId?: string;
  subcategoryId?: string;
  issueId?: string;
  caseType: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  campaignId?: string;
  paymentId?: string;
  transactionId?: string;
  contextJson?: Record<string, unknown>;
  assignedAdminId?: string;
  assignedAdminName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages?: SupportCaseMessage[];
  attachments?: SupportCaseAttachment[];
  notes?: SupportCaseNote[];
  events?: SupportCaseEvent[];
}

export interface SupportCaseMessage {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  createdAt: string;
  readAt?: string;
}

export interface SupportCaseAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  createdAt: string;
}

export interface SupportCaseNote {
  id: string;
  note: string;
  adminName: string;
  createdAt: string;
}

export interface SupportCaseEvent {
  id: string;
  eventType: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface SupportSummary {
  openCases: number;
  highPriority: number;
  unassigned: number;
  waitingForUser: number;
  resolvedToday: number;
}

export interface CreateSupportCaseInput {
  categoryId?: string;
  subcategoryId?: string;
  issueId?: string;
  subject: string;
  description: string;
  caseType?: string;
  priority?: string;
  campaignId?: string;
  paymentId?: string;
  transactionId?: string;
  contextJson?: Record<string, unknown>;
}
