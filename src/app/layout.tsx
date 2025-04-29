import type { Metadata } from "next";
import { Montserrat, Inter, DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from './component/header';
import Footer from './component/footer';

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", '100', '200', '900'],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AI Resume Comparison Tool",
  description: "An AI-powered tool to help HR teams quickly compare multiple resumes against a job description. Upload 3 resumes, select custom criteria (skills, experience, certifications, etc.), and get an AI-driven comparison with ranked insights—making hiring decisions faster and smarter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${montserrat.variable} ${inter.variable} ${dmSans.variable} ${plusJakartaSans.variable} antialiased flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
