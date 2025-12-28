import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AuthWrapper from "@/components/AuthWrapper";
import GeminiChatbot from "./components/GeminiChatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AgriFinAI",
  description: "Empowering Indian agriculture with AI-powered financial and crop advisory solutions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var darkMode = localStorage.getItem('darkMode');
                  if (darkMode === 'true') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Header />
        <AuthWrapper>
          <main>{children}</main>
        </AuthWrapper>
        <GeminiChatbot />
      </body>
    </html>
  );
}
