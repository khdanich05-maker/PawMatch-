import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import UrgentCasesSection from "@/components/home/UrgentCasesSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ReportCtaSection from "@/components/home/ReportCtaSection";

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <StatsSection />
      <UrgentCasesSection />
      <HowItWorksSection />
      <ReportCtaSection />
    </div>
  );
}