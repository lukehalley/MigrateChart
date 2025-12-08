import MobileSectionPage from "@/components/MobileSectionPage";
import MetricsTrackingSection from "@/components/MetricsTrackingSection";

export default function FeaturesPage() {
  return (
    <MobileSectionPage nextPage={{ href: "/examples", label: "Examples" }}>
      <MetricsTrackingSection />
    </MobileSectionPage>
  );
}
