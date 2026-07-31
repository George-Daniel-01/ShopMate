import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Premium Electronics",
      subtitle: "Discover the latest tech innovations",
      description:
        "Up to 50% off on premium headphones, smartwatches, and more",
      image: "/electronics.jpg",
      cta: "Shop Electronics",
      url: "/products?category=Electronics",
    },
    {
      id: 2,
      title: "Fashion Forward",
      subtitle: "Style meets comfort",
      description: "New arrivals in designer clothing and accessories",
      image: "/fashion.jpg",
      cta: "Explore Fashion",
      url: "/products?category=Fashion",
    },
    {
      id: 3,
      title: "Home & Garden",
      subtitle: "Transform your space",
      description: "Beautiful furniture and decor for every home",
      image: "/furniture.jpg",
      cta: "Shop Home",
      url: "/products?category=Home%20%26%20Garden",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden rounded-2xl">
      {/* Single Active Slide */}
      <div className="relative h-full">
        <div className="absolute inset-0 bg-cover bg-center animate-ken-burns"
          style={{ backgroundImage: `url(${slide.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
        <div className="relative h-full flex items-center justify-center text-center px-4 sm:px-6">
          <div className="max-w-3xl animate-fade-in-up">
            <h3 className="text-base sm:text-lg font-medium text-white/90 mb-2">
              {slide.subtitle}
            </h3>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
              {slide.title}
            </h1>
            <p className="text-base sm:text-xl text-white/85 mb-6 sm:mb-8 max-w-2xl mx-auto">
              {slide.description}
            </p>
            <Link
              to={slide.url}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 hover:shadow-[var(--shadow-elegant)] animate-smooth font-semibold text-base sm:text-lg"
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="hidden sm:block absolute left-6 top-1/2 transform -translate-y-1/2 p-3 glass-card hover:glow-on-hover animate-smooth"
      >
        <ChevronLeft className="w-6 h-6 text-primary" />
      </button>
      <button
        onClick={nextSlide}
        className="hidden sm:block absolute right-6 top-1/2 transform -translate-y-1/2 p-3 glass-card hover:glow-on-hover animate-smooth"
      >
        <ChevronRight className="w-6 h-6 text-primary" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-primary glow-primary"
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
