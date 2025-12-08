import MobileSectionPage from "@/components/MobileSectionPage";
import PricingSection from "@/components/PricingSection";

export default function PricingPage() {
  return (
    <MobileSectionPage nextPage={{ href: "/contact", label: "Contact" }}>
      <PricingSection />
    </MobileSectionPage>
  );
}
