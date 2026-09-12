import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export const metadata: Metadata = {
  title: 'Smart Internship Matching Portal | AI-Powered Internship Platform',
  description: 'Intelligently connects students with premium internship opportunities based on skills, resume parsing, ATS scoring, and recruiter matching metrics.',
  keywords: ['internships', 'AI recruitment', 'resume parser', 'ATS grader', 'student career portal'],
  authors: [{ name: 'Antigravity Architect' }]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
