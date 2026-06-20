import './globals.css';
import { WorkspaceProvider } from '../context/WorkspaceContext';

export const metadata = {
  title: 'GrowwWorkspace - Collaborative Real-Time EMI Studio',
  description: 'A collaborative, real-time shared workspace for financial planning, loan comparisons, prepayments, and sensitivity analysis.',
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
