export interface JobInvitation {
  id: string;
  jobId: string;
  candidateEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
  jobDetails: {
    id: string;
    title: string;
    description: string;
    organizationId: string;
    organizationName?: string;
    location?: string;
    salary?: string;
    type?: string;
    experience?: string;
  };
  invitedByDetails: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export interface JobApplicationTableData {
  id: string;
  uuid: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'in_progress' | 'completed';
  preferredLanguage: string;
  candidate: {
    email: string;
    name: string;
  };
  jobDetails: {
    title: string;
    description: string;
    skills: string[];
    benefits?: string;
    requirements?: string;
  };
  jobId: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}
