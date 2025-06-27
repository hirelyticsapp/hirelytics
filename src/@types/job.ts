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
