import {
  Announcement,
  SiteHeader,
  SiteFooter,
  LeftSidebar,
  RightSidebar,
} from "@/components/layout";
import {
  HeroSection,
  TrustSection,
  ValueSection,
  QuestionsSection,
  WorkflowSection,
  CtaSection,
} from "@/components/sections";

export default function Home() {
  return (
    <div className="app-shell">
      <LeftSidebar />
      <main id="top" className="center-scroll">
        <Announcement />
        <SiteHeader />
        <HeroSection />
        <TrustSection />
        <ValueSection />
        <QuestionsSection />
        <WorkflowSection />
        <CtaSection />
        <SiteFooter />
      </main>
      <RightSidebar />
    </div>
  );
}
