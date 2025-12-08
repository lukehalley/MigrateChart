import MobileSectionPage from "@/components/MobileSectionPage";
import ProjectsSection from "@/components/sections/ProjectsSection";

export default function ExamplesPage() {
  return (
    <MobileSectionPage nextPage={{ href: "/community", label: "Community" }}>
      <ProjectsSection />
    </MobileSectionPage>
  );
}
