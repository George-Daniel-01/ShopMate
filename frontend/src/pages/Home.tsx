import React, { useEffect } from "react";
import HeroSlider from "../components/Home/HeroSlider";
import CategoryGrid from "../components/Home/CategoryGrid";
import ProductSlider from "../components/Home/ProductSlider";
import FeatureSection from "../components/Home/FeatureSection";
import TestimonialsSection from "../components/Home/TestimonialsSection";
import StatsBar from "../components/Home/StatsBar";
import NewsletterSection from "../components/Home/NewsletterSection";
import { fetchAllProducts } from "../store/slices/productSlice";
import { useAppSelector, useAppDispatch } from "../store/hooks";


const Index = () => {
  const dispatch = useAppDispatch();
  const { products, topRatedProducts, newProducts } = useAppSelector(
    (state) => state.product
  );

  useEffect(() => {
    dispatch(
      fetchAllProducts({
        category: "",
        price: "0-10000",
        search: "",
        ratings: 0,
        availability: "",
        page: 1,
      })
    );
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <HeroSlider />
      <div className="container mx-auto px-4 pt-20">
        <CategoryGrid />

        {/* Always show all products */}
        {products.length > 0 && (
          <ProductSlider title="All Products" products={products} />
        )}

        {/* Only show if there are new products (added within 30 days) */}
        {newProducts.length > 0 && (
          <ProductSlider title="New Arrivals" products={newProducts} />
        )}

        {/* Only show if there are top rated products (rating >= 4.5) */}
        {topRatedProducts.length > 0 && (
          <ProductSlider title="Top Rated Products" products={topRatedProducts} />
        )}

        <FeatureSection />
        <TestimonialsSection />
      </div>
      <StatsBar />
      <div className="container mx-auto px-4">
        <NewsletterSection />
      </div>
    </div>
  );
};

export default Index;