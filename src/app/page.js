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
      <FeaturedProducts products={products} />
      <CategoriesSection />
      <SuccessStories reviews={reviews} />
      <StatsSection stats={stats} />
      <SustainabilitySection />
      <TrustedSellers sellers={sellers} />
    </div>
  );
}
