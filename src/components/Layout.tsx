import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Shared site chrome.
 * Pattern A (children): App wraps `<Routes>` inside `<Layout>`.
 * The Navbar is `fixed` (design.md §8.1), so Layout owns the offset:
 * the content slot carries top padding equal to the nav height (64px).
 * Full-bleed heroes opt out inside their page, not here.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] bg-ink text-bone">
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}
