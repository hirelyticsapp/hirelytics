export const Role = {
  ADMIN: 'admin',
  CANDIDATE: 'user',
  RECRUITER: 'recruiter',
};

export type UserRole = (typeof Role)[keyof typeof Role];
