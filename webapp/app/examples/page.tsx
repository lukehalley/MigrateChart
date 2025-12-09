import MobileSectionPage from "@/components/MobileSectionPage";
import ProjectsSectionShared from "@/components/sections/ProjectsSectionShared";

export default function ExamplesPage() {
  return (
    <MobileSectionPage nextPage={{ href: "/community", label: "Community" }}>
      <ProjectsSectionShared />
    </MobileSectionPage>
  );
}
