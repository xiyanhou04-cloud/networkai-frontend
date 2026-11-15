import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
 
export const metadata: Metadata = {
  title: "NetworkAI",
  description: "Share and discover creative work.",
};
 
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
	<html lang="en">
  	<body>
    	<header className="border-b border-slate-200 bg-white">
      	<nav aria-label="Main navigation"
        	className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3 sm:px-8">
        	<Link href="/" className="font-semibold">NetworkAI</Link>
        	<Link href="/" aria-current="page" className="text-sm underline">
          	Discover
        	</Link>
      	</nav>
    	</header>
    	{children}
  	</body>
	</html>
  );
}
