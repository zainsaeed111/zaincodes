import type { Metadata } from "next";
import { Outfit, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { getHomeContent } from "@/lib/content";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { PageLoader } from "@/components/PageLoader";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"),
  title: {
    default: "ZainCodes — Web, Full Stack & Mobile Development",
    template: "%s | ZainCodes",
  },
  description:
    "ZainCodes builds production web platforms, full-stack systems, and Android/Flutter mobile applications with clean architecture and careful craft.",
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let footerBlurb: string | null = null;
  let email: string | null = null;
  let social: Array<{ name: string; url: string }> = [];
  let whatsapp: string | null = null;
  let hasResume = false;

  try {
    const content = await getHomeContent();
    footerBlurb = content.settings?.footerBlurb || null;
    email = content.contact?.email || null;
    social = (content.social || []).map((s) => ({ name: s.name, url: s.url }));
    whatsapp = content.settings?.whatsappE164 || content.contact?.phone || null;
    hasResume = Boolean(content.resume);
  } catch {
    // DB may still be warming on first boot
  }

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Blocking inline script — prevents dark flash in light mode */}
        <script
          id="theme-boot"
          dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
        />
      </head>
      <body className={`${display.variable} ${body.variable}`}>
        <ThemeProvider>
          <div className="site-shell">
            <PageLoader />
            <SiteHeader />
            {children}
            <SiteFooter
              blurb={footerBlurb}
              email={email}
              whatsapp={whatsapp}
              social={social}
              hasResume={hasResume}
            />
            <WhatsAppFab e164={whatsapp} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
