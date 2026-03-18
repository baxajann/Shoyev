import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ГородОК — Отправка и отслеживание локальных проблем',
  description: 'Платформа для взаимодействия граждан с городскими службами. Сообщайте о проблемах, отслеживайте их решение.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 64px)', paddingTop: '64px' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
