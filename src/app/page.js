import HeroSection from "@/components/All/Home/HeroSection";
import FeaturedProducts from "@/components/All/Home/FeaturedProducts";
import CategoriesSection from "@/components/All/Home/CategoriesSection";
import SuccessStories from "@/components/All/Home/SuccessStories";
import StatsSection from "@/components/All/Home/StatsSection";
import SustainabilitySection from "@/components/All/Home/SustainabilitySection";
import TrustedSellers from "@/components/All/Home/TrustedSellers";
import {
  getProducts,
  getMarketplaceStats,
  getAllReviews,
  getTopSellers,
} from "@/lib/action/action";
import CTABanner from "@/components/All/Home/CTA";
import HowItWorksSection from "@/components/All/Home/HowItWorks";
import SectionRelay from "@/components/All/Home/SectionRelay";

export default async function Home() {
  const [productsData, statsData, reviewsData, sellersData] = await Promise.all([
    getProducts({ limit: 8 }),
    getMarketplaceStats(),
    getAllReviews(3),
    getTopSellers(3),
  ]);

  const products = productsData?.result ?? [];
  const stats = statsData?.result ?? null;
  const reviews = reviewsData?.result ?? [];
  const sellers = sellersData?.result ?? [];

  return (
    <div className="flex flex-col">
      <HeroSection stats={stats} />
      {/* Color relay: each section starts on the color the previous one ended on */}
      <SectionRelay from="chart-1" to="chart-2">
        <FeaturedProducts products={products} />
      </SectionRelay>
      <SectionRelay from="chart-2" to="chart-3">
        <CategoriesSection />
      </SectionRelay>
      <SectionRelay from="chart-3" to="chart-1">
        <HowItWorksSection />
      </SectionRelay>
      <SectionRelay from="chart-1" to="chart-2">
        <SuccessStories reviews={reviews} />
      </SectionRelay>
      {/* Dark band: deliberate break; relay resumes on chart-2 after it */}
      <StatsSection stats={stats} />
      <SectionRelay from="chart-2" to="chart-3">
        <SustainabilitySection />
      </SectionRelay>
      <SectionRelay from="chart-3" to="chart-1">
        <TrustedSellers sellers={sellers} />
      </SectionRelay>
      <SectionRelay from="chart-1" to="background">
        <CTABanner />
      </SectionRelay>
    </div>
  );
}
