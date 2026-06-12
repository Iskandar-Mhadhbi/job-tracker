export type ApplicationStatus =
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  company_name: string;
  role_title: string;
  status: ApplicationStatus;
  applied_date: string;
  notes?: string;
  follow_up_date?: string;
  job_url?: string;
  location?: string;
  userId: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationPayload {
  company_name: string;
  role_title: string;
  status?: ApplicationStatus;
  applied_date: string;
  notes?: string;
  follow_up_date?: string;
  job_url?: string;
  location?: string;
}

export interface ApplicationStats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: '#3b82f6',
  interview: '#f59e0b',
  offer: '#10b981',
  rejected: '#ef4444',
  withdrawn: '#6b7280',
};
