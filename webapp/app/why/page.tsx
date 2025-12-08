import MobileSectionPage from "@/components/MobileSectionPage";
import ProblemSection from "@/components/sections/ProblemSection";
import SolutionSection from "@/components/sections/SolutionSection";

export default function WhyPage() {
  return (
    <MobileSectionPage nextPage={{ href: "/features", label: "Features" }}>
      <ProblemSection />
      <SolutionSection />
    </MobileSectionPage>
  );
}
