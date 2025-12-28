import "./globals.css";
import Navbar from "@/components/Navbar";
import ToastProvider from "@/components/ToastProvider";
import Providers from "@/components/Providers"
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

// Using system fonts via CSS variables defined in globals.css


export const metadata = {
  metadataBase: new URL("https://eleczen.app"),
  title: {
    default: "ElecZen | AI-Powered Electronics Platform",
    template: "%s | ElecZen",
  },
  description:
    "The ultimate platform for electronics engineers. Design, simulate, and discover components with AI-powered tools like Circuit Recognizer and Component Scanner.",
  keywords: [
    "electronics",
    "circuit design",
    "simulation",
    "PCB",
    "AI tools",
    "component encyclopedia",
    "engineering",
    "IoT",
    "Arduino",
    "ESP32",
    "resistor color code",
    "ohm's law calculator",
    "capacitor code decoder",
    "circuit scanner",
    "schematic recognizer",
  ],
  authors: [{ name: "ElecZen Team" }],
  creator: "ElecZen",
  publisher: "ElecZen",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/eleczen.svg", type: "image/svg+xml" },
      { url: "/eleczen_16.png", sizes: "16x16", type: "image/png" },
      { url: "/eleczen_32.png", sizes: "32x32", type: "image/png" },
      { url: "/eleczen_48.png", sizes: "48x48", type: "image/png" },
      { url: "/eleczen_64.png", sizes: "64x64", type: "image/png" },
      { url: "/eleczen_128.png", sizes: "128x128", type: "image/png" },
      { url: "/eleczen_192.png", sizes: "192x192", type: "image/png" },
      { url: "/eleczen_256.png", sizes: "256x256", type: "image/png" },
      { url: "/eleczen_512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/eleczen_180.png", sizes: "180x180", type: "image/png" },
      { url: "/eleczen_192.png", sizes: "192x192", type: "image/png" },
      { url: "/eleczen_512.png", sizes: "512x512", type: "image/png" },
    ],
    other: [{ rel: "mask-icon", url: "/eleczen.svg" }],
  },
  openGraph: {
    title: {
      default: "ElecZen | AI-Powered Electronics Platform",
      template: "%s | ElecZen",
    },
    description:
      "The ultimate platform for electronics engineers. Design circuits, simulate in real-time, and discover components with AI-powered tools.",
    url: "https://eleczen.app",
    siteName: "ElecZen",
    images: [
      {
        url: "/eleczen_512.png",
        width: 512,
        height: 512,
        alt: "ElecZen Platform Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "ElecZen | AI-Powered Electronics Platform",
      template: "%s | ElecZen",
    },
    description: "The ultimate platform for electronics engineers. Design, simulate, and discover components with AI-powered tools.",
    creator: "@eleczen",
    images: ["/eleczen_512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: "ElecZen",
    statusBarStyle: "black-translucent",
    startupImage: ["/eleczen_512.png"],
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased min-h-screen bg-black text-white selection:bg-neon-blue/30 relative`}
      >
        {/* Background Grid Effect */}
        <div
          className="fixed inset-0 z-[-1] opacity-20 pointer-events-none"
          style={{ backgroundImage: 'url("/grid.svg")' }}
        />
        <Providers>
          <ToastProvider />
          <Navbar />
          <main className="pt-16 min-h-screen">{children}</main>
          <BottomNav />
        </Providers>
      </body>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3992023609980021"
        crossOrigin="anonymous"></script>
    </html>
  );
}
