import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { PassiveSocketProvider } from "@/context/passive-socket-context";
import SessionProvider from "@/context/session-context";
import { getUserInfo } from "@/actions/user-actions/get-user-info";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

const SITE_NAME = 'StrangerLink';
const BASE_URL = 'https://strangerlink.click';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Anonymous Chat | Talk to Strangers Online`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'StrangerLink is a free anonymous chat platform and Omegle alternative. Talk to strangers instantly with global chat, random matching, and private rooms. No signup required to start.',
  keywords: [
    'Omegle alternative',
    'anonymous chat',
    'talk to strangers',
    'random chat',
    'stranger chat',
    'online chat',
    'free chat',
    'chat roulette',
    'anonymous messaging',
    'global chat room',
    'meet new people',
    'video chat alternative',
    'stranger talk',
    'chat with strangers',
  ],
  authors: [{ name: 'StrangerLink' }],
  creator: 'StrangerLink',
  publisher: 'StrangerLink',
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Talk to Strangers Online | Free Anonymous Chat`,
    description:
      'Meet new people instantly. StrangerLink is a modern Omegle alternative with global chat, random matching, and private rooms. Anonymous, fast, and free.',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'StrangerLink — Anonymous Chat Platform',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Talk to Strangers | Free Anonymous Chat`,
    description:
      'A modern Omegle alternative. Chat anonymously with strangers worldwide — global rooms, random matches, and private chats.',
    images: [DEFAULT_OG_IMAGE],
    creator: '@strangerlink',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
  verification: {},
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUserInfo();

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="canonical" href={BASE_URL} />
      </head>
      <body
        className={`${roboto.variable} antialiased h-full`}
      >
        <PassiveSocketProvider>
          <SessionProvider initialSession={user}>{children}</SessionProvider>
        </PassiveSocketProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
