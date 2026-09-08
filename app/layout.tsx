import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ToastProvider } from '@/components/ToastProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'EventHub Thailand - แพลตฟอร์มจัดกิจกรรมและจอง Event ระดับมืออาชีพ',
  description: 'ค้นหา จองตั๋ว และเข้าร่วมงานสัมมนา เทคโนโลยี AI เวิร์กช็อป และเทศกาลดนตรีชั้นนำในประเทศไทย พร้อมระบบออก E-Ticket QR Code ทันสมัย',
  keywords: ['Event', 'จองกิจกรรม', 'สัมมนา', 'คอนเสิร์ต', 'เวิร์กช็อป', 'Next.js', 'Tailwind CSS', 'Supabase', 'E-Ticket'],
  authors: [{ name: 'EventHub Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className="bg-dark-900 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">
        <AppProvider>
          <ToastProvider />
          <div className="relative flex flex-col min-h-screen">
            {/* Ambient Background Lights */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed top-1/3 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-10 left-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
