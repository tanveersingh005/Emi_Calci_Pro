import './globals.css';
import { WorkspaceProvider } from '../context/WorkspaceContext';

export const metadata = {
  title: 'EMI Workspace - Collaborative Calculator',
  description: 'A collaborative, real-time shared workspace for financial planning, loan comparisons, prepayments, and sensitivity analysis.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%234f46e5"/><rect x="25" y="22" width="50" height="56" rx="8" fill="none" stroke="white" stroke-width="6"/><rect x="33" y="30" width="34" height="10" rx="2" fill="white"/><circle cx="38" cy="50" r="3.5" fill="white"/><circle cx="50" cy="50" r="3.5" fill="white"/><circle cx="62" cy="50" r="3.5" fill="white"/><circle cx="38" cy="62" r="3.5" fill="white"/><circle cx="50" cy="62" r="3.5" fill="white"/><circle cx="62" cy="62" r="3.5" fill="white"/></svg>',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen">
        <WorkspaceProvider>
          {children}
        </WorkspaceProvider>
      </body>
    </html>
  );
}
