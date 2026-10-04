import type { Metadata } from "next";
import { Archivo, Geist_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

// One variable family, squeezed (62%) for display and stretched (125%) for the wordmark.
// The wdth axis has to be requested explicitly or next/font ships weight only.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// the hero kit's colours; the stage repaints the hidden set and crossfades on every kit change
const ATMOS_START = { "--a": "#14388a", "--b": "#8a1437", "--c": "#e3b53e" } as React.CSSProperties;

export const metadata: Metadata = {
  title: { default: "dripkits", template: "%s | dripkits" },
  description: "Football kits for India. Buy what is in stock, claim your size on the rest, and enough claims gets it made.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("font-sans antialiased", archivo.variable, geistMono.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground">
        {/* the page atmosphere: soft fields in the colours of the kit on screen */}
        <div aria-hidden="true" className="atmos">
          <div className="atmos-set" data-on="true" style={ATMOS_START}>
            <i />
            <i />
            <i />
          </div>
          <div className="atmos-set" data-on="false" style={ATMOS_START}>
            <i />
            <i />
            <i />
          </div>
        </div>
        <SmoothScroll />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
