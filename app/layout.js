import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Destino Au Pair",
  description: "Descubre el mundo como Au Pair. Vive una experiencia única de intercambio cultural, aprende idiomas y crea recuerdos inolvidables en el extranjero.",
  metadataBase: new URL("https://www.destino-aupair.com"),

  openGraph: {
    title: "Destino Au Pair",
    description: "Descubre el mundo como Au Pair. Vive una experiencia única de intercambio cultural.",
    url: "https://www.destino-aupair.com",
    siteName: "Destino Au Pair",
    images: [
      {
        url: "/assets/logo1-internet.png",
        width: 800,
        height: 800,
        alt: "Destino Au Pair",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Destino Au Pair",
    description: "Descubre el mundo como Au Pair.",
    images: ["/assets/logo1-internet.png"],
  },

  icons: {
    icon: "/assets/logo1-internet.png",
    apple: "/assets/logo1-internet.png",
  },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}