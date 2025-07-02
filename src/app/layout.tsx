import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // This line was causing an error and is removed.
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Pantry Chef AI',
  description: 'Get advanced recipe suggestions based on your ingredients and dietary needs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable
          // GeistMono.variable // This was part of the problematic import
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
