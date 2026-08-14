import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { ConnectivityWatcher } from "@/components/app-shell/connectivity-watcher";
import { ServiceWorkerRegister } from "@/components/app-shell/service-worker-register";
import { createPublicClient } from "@/lib/supabase/public";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FarataNikah — La plateforme de mariage halal pour musulmans d'Afrique",
    template: "%s | FarataNikah",
  },
  description:
    "FarataNikah connecte des musulmans sérieux en vue du mariage, partout en Afrique et en conformité avec les valeurs islamiques. Profils vérifiés, messagerie modérée, coach IA Amina.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = createPublicClient();
  const { data: settings } = await supabase
    .from("app_settings")
    .select("meta_pixel_id")
    .eq("id", true)
    .maybeSingle();

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ConnectivityWatcher />
        <ServiceWorkerRegister />
        <Analytics />
        {settings?.meta_pixel_id && <MetaPixel pixelId={settings.meta_pixel_id} />}
      </body>
    </html>
  );
}
