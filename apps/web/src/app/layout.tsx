import './global.css';
import { Layout } from '@messai/ui';
import { AuthProvider } from '../lib/auth';

export const metadata = {
  title: 'MESSAI.AI - Microbial Electrochemical Systems AI Platform',
  description:
    'Democratize microbial electrochemical systems research through AI-powered tools, 3D modeling, and intelligent predictions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navigation = [
    { label: 'Dashboard', href: '/' },
    { label: 'Research', href: '/research' },
    { label: 'About', href: '/about' },
    { label: 'Laboratory', href: '/lab' },
    { label: 'Lab-IO', href: '/lab-io' },
    { label: 'Parameters', href: '/parameters' },
    { label: 'Predictions', href: '/predictions' },
  ];

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Layout navigation={navigation}>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
