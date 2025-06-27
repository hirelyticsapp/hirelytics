import { AuthProvider } from '@/context/auth-context';

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
