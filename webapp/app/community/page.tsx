import MobileSectionPage from "@/components/MobileSectionPage";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

export default function CommunityPage() {
  return (
    <MobileSectionPage nextPage={{ href: "/pricing", label: "Pricing" }}>
      <TestimonialsCarousel />
    </MobileSectionPage>
  );
}
