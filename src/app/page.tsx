import React from "react";
import Hero from "@/components/home/Hero";
import Pricing from "@/components/home/Pricing";
import CTA from "@/components/home/CTA";
import AboutCTA from "@/components/home/AboutCTA";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

export default function HomePage() {
  return (
    <div>
      <Navigation />
      <Hero />
      <AboutCTA />
      <CTA />
      <Pricing />
      <Footer />
    </div>
  );
}
