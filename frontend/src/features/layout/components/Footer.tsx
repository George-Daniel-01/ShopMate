import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { Github, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const footerLinks = {
    company: [
      { name: "About Us", path: "/about" },
      { name: "Careers", path: "#" },
      { name: "Press", path: "#" },
      { name: "Blog", path: "#" },
    ],
    customer: [
      { name: "Contact Us", path: "/contact" },
      { name: "FAQ", path: "/faq" },
      { name: "Shipping Info", path: "#" },
      { name: "Returns", path: "#" },
    ],
    legal: [
      { name: "Privacy Policy", path: "#" },
      { name: "Terms of Service", path: "#" },
      { name: "Cookie Policy", path: "#" },
      { name: "Security", path: "#" },
    ],
  };

  const socialLinks = [
    { icon: Github, href: "https://github.com/George-Daniel-01", label: "GitHub" },
    { icon: Mail, href: "mailto:georgeabiamakadaniel@gmail.com", label: "Email" },
  ];

  const LinkColumn = ({
    title,
    links,
  }: {
    title: string;
    links: { name: string; path: string }[];
  }) => (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              to={link.path}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="border-t border-border mt-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                S
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-primary">
                ShopMate
              </h2>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
              Your trusted partner for online shopping. Discover amazing products
              with exceptional quality and service.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-sm">georgeabiamakadaniel@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-sm">07060512564</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm">Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          <LinkColumn title="Company" links={footerLinks.company} />
          <LinkColumn title="Customer Service" links={footerLinks.customer} />
          <LinkColumn title="Legal" links={footerLinks.legal} />
        </div>

        {/* Newsletter Signup */}
        <div className="glass-panel mb-12 max-w-3xl mx-auto text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Stay Connected
          </h3>
          <p className="text-muted-foreground mb-6">
            Subscribe to our newsletter for exclusive offers and updates
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Subscribed! Watch your inbox.");
              setEmail("");
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary text-foreground placeholder-muted-foreground transition-all"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 gradient-primary text-primary-foreground rounded-xl hover:shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 animate-smooth font-semibold"
            >
              Subscribe
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Social Links & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border gap-4">
          <div className="flex items-center space-x-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="p-2.5 glass-card rounded-xl hover:-translate-y-0.5"
              >
                <social.icon className="w-5 h-5 text-primary" />
              </a>
            ))}
          </div>
          <div className="text-center md:text-right">
            <p className="text-muted-foreground text-sm">
              © 2026 ShopMate. All rights reserved.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Developed By Daniel George
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
