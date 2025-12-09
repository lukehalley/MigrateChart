import MobileSectionPage from "@/components/MobileSectionPage";
import UnifiedMetricsShowcase from "@/components/UnifiedMetricsShowcase";

export default function FeaturesPage() {
  return (
    <MobileSectionPage nextPage={{ href: "/examples", label: "Examples" }}>
      <UnifiedMetricsShowcase />
    </MobileSectionPage>
  );
}
