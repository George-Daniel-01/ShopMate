import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Verified Buyer",
    text: "Absolutely love the quality and speed of delivery. The AI search found me the perfect headphones in seconds — it's like having a personal shopper.",
    rating: 5,
    avatar: "SM",
    color: "bg-blue-600",
  },
  {
    name: "James Okafor",
    role: "Verified Buyer",
    text: "Best shopping experience I've had online. Checkout was smooth, payment was secure, and my order arrived two days early. Highly recommend!",
    rating: 5,
    avatar: "JO",
    color: "bg-emerald-600",
  },
  {
    name: "Emily Chen",
    role: "Verified Buyer",
    text: "The wishlist feature is a game changer. I saved items across weeks and the prices never disappointed. Customer support responded within minutes.",
    rating: 5,
    avatar: "EC",
    color: "bg-purple-600",
  },
  {
    name: "David Adeyemi",
    role: "Verified Buyer",
    text: "From browsing to buying, everything just works. The product photos are accurate, sizes match, and returns are hassle-free. My go-to store now.",
    rating: 4,
    avatar: "DA",
    color: "bg-rose-600",
  },
];

const TestimonialsSection = () => {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoplay]);

  const t = testimonials[index];

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-2">What Our Customers Say</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Join thousands of happy shoppers who trust ShopMate for quality products and seamless service.
        </p>
      </div>

      <div
        className="max-w-3xl mx-auto relative"
        onMouseEnter={() => setAutoplay(false)}
        onMouseLeave={() => setAutoplay(true)}
      >
        <div key={index} className="bg-card border border-border rounded-lg p-8 md:p-12 text-center animate-fade-in-up shadow-[var(--shadow-glass)]">
          <Quote className="w-10 h-10 text-primary/30 mx-auto mb-4" />
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < t.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6 italic">
            "{t.text}"
          </p>
          <div className="flex items-center justify-center gap-3">
            <div
              className={`w-12 h-12 rounded-full ${t.color} text-white flex items-center justify-center font-bold text-sm`}
            >
              {t.avatar}
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">{t.name}</p>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
          className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 p-3 bg-card border border-border rounded-full shadow-[var(--shadow-glass)] hover:bg-secondary transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIndex((prev) => (prev + 1) % testimonials.length)}
          className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 p-3 bg-card border border-border rounded-full shadow-[var(--shadow-glass)] hover:bg-secondary transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/40"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
