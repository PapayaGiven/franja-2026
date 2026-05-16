import type { ReactNode } from "react";
import { BannerStrip } from "@/components/nav/BannerStrip";
import { UpcomingFavoriteBanner } from "@/components/nav/UpcomingFavoriteBanner";
import { BottomNav } from "@/components/nav/BottomNav";

/**
 * Shared chrome for every public-facing page. The banner strip sits
 * above the fold (sticky top), the upcoming-favorite banner pushes in
 * below it when a saved session is within 15 minutes, and the bottom
 * nav anchors the mobile UX.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BannerStrip />
      <UpcomingFavoriteBanner />
      <main className="mx-auto w-full max-w-screen-sm flex-1 px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
