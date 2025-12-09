import MobileSectionPage from "@/components/MobileSectionPage";
import ProblemSectionShared from "@/components/sections/ProblemSectionShared";
import SolutionSectionShared from "@/components/sections/SolutionSectionShared";

export default function WhyPage() {
  return (
    <MobileSectionPage nextPage={{ href: "/features", label: "Features" }}>
      <ProblemSectionShared />
      <SolutionSectionShared />
    </MobileSectionPage>
  );
}
