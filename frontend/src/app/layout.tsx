import type { Metadata } from "next";
import { Inter, EB_Garamond, Italiana } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/components/providers";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
    variable: "--font-eb-garamond",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const italiana = Italiana({
    variable: "--font-italiana",
    subsets: ["latin"],
    weight: "400",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://app.zaneoss.com"),
    title: "Zane - AI Legal Platform",
    description:
        "AI-powered legal document analysis and contract review platform.",
    icons: {
        icon: [
            { url: "/icon.svg", type: "image/svg+xml" },
            { url: "/favicon.ico" },
        ],
        apple: "/apple-touch-icon.png",
    },
    openGraph: {
        type: "website",
        url: "https://app.zaneoss.com",
        siteName: "Zane",
        title: "Zane - AI Legal Platform",
        description:
            "AI-powered legal document analysis and contract review platform.",
        images: [
            {
                url: "/link-image.jpg",
                width: 1200,
                height: 651,
                alt: "Zane",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Zane - AI Legal Platform",
        description:
            "AI-powered legal document analysis and contract review platform.",
        images: ["/link-image.jpg"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${inter.variable} ${ebGaramond.variable} ${italiana.variable} font-sans antialiased`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
