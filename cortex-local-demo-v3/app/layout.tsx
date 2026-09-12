import "./globals.css";

export const metadata = {
  title: "Cortex Demo",
  description: "Cortex local frontend prototype"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
