import React from "react";
import FullHomePage from "@/components/landingpage/FullHomePage";
import Navigation from "@/components/landingpage/Navigation";
import Footer from "@/components/landingpage/Footer";

export default function HomePage() {
  return (
    <div>
      <Navigation />
      <FullHomePage />
      <Footer />
    </div>
  );
}
