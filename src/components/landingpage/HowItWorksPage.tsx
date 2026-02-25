"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function HowItWorksPage() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <main className="bg-white text-gray-900">
      {/* ================= HERO ================= */}
      <section className="relative bg-[#1f1f1f] text-white px-6 py-36 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="text-5xl md:text-6xl font-bold mb-8"
          >
            How <span className="text-orange-500">Waste X</span> Works
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed"
          >
            Waste X provides structured digital infrastructure for
            construction-grade waste transfers — from listing creation to
            completion logging and audit-ready documentation.
          </motion.p>
        </div>
      </section>

      {/* ================= SYSTEM FLOW ================= */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-20">
            Structured Operational Workflow
          </h2>

          <div className="grid md:grid-cols-5 gap-8 text-center">
            <Step
              number="01"
              title="Create Waste Listing"
              text="Generator records structured waste data including quantity, classification, and site details."
            />
            <Step
              number="02"
              title="Carrier Participation"
              text="Licensed carriers submit structured bids within a controlled environment."
            />
            <Step
              number="03"
              title="Assignment Confirmation"
              text="Selected carrier is digitally assigned and recorded within the platform."
            />
            <Step
              number="04"
              title="Collection Logging"
              text="Carrier confirms collection and documents transfer activity."
            />
            <Step
              number="05"
              title="Completion & Audit Trail"
              text="System generates structured digital record for compliance and reporting."
            />
          </div>
        </div>
      </section>

      {/* ================= PARALLAX BREAK ================= */}
      <section ref={ref} className="relative h-[500px] overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1642204705127-accc0dcc5779?auto=format&fit=crop&w=2000&q=80"
            alt="Construction waste"
            fill
            sizes="100vw"
            className="object-cover scale-110"
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative h-full flex items-center justify-center text-white text-center px-6">
          <h3 className="text-4xl md:text-5xl font-bold max-w-3xl">
            Built for Operational Control & Regulatory Alignment
          </h3>
        </div>
      </section>

      {/* ================= ROLE SECTIONS ================= */}

      {/* WASTE MANAGERS */}
      <section
        id="waste-managers"
        className="py-32 px-6 bg-gray-100 border-t-8 border-orange-500"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8 text-orange-500">
              Waste Managers
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Waste X enables structured oversight of waste flows across
              multiple sites, projects, and organisations.
            </p>

            <ul className="space-y-4 text-gray-700">
              <li>• Centralised visibility of active listings</li>
              <li>• Digital assignment confirmation</li>
              <li>• Incident documentation logs</li>
              <li>• Structured audit-ready export capability</li>
              <li>• Organisation-scoped data segmentation</li>
            </ul>
          </div>

          <div className="relative h-[400px]">
            <Image
              src="https://images.unsplash.com/photo-1763315156830-07870b159121?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2FzdGUlMjBtYW5hZ2Vyc3xlbnwwfHwwfHx8MA%3D%3D"
              alt="Waste manager on site"
              fill
              sizes="100vw"
              className="object-cover border-4 border-orange-500"
            />
          </div>
        </div>
      </section>

      {/* WASTE CARRIERS */}
      <section
        id="waste-carriers"
        className="py-32 px-6 bg-[#2b2b2b] text-white"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="relative h-[400px]">
            <Image
              src="https://images.unsplash.com/photo-1608476524605-2ad765c3bd78?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d2FzdGUlMjBjYXJyaWVyfGVufDB8fDB8fHww"
              alt="Waste carrier truck"
              fill
              sizes="100vw"
              className="object-cover border-4 border-orange-500"
            />
          </div>

          <div>
            <h2 className="text-4xl font-bold mb-8 text-orange-500">
              Waste Carriers
            </h2>

            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              Licensed carriers operate within a structured digital bidding and
              assignment environment.
            </p>

            <ul className="space-y-4 text-gray-300">
              <li>• Access to verified bid opportunities</li>
              <li>• Assignment clarity & confirmation</li>
              <li>• Digital collection logging</li>
              <li>• Transfer history records</li>
              <li>• Reduced administrative overhead</li>
            </ul>
          </div>
        </div>
      </section>

      {/* WASTE GENERATORS */}
      <section
        id="waste-generators"
        className="py-32 px-6 bg-white border-t-8 border-orange-500"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8 text-orange-500">
              Waste Generators
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Construction sites, contractors, and infrastructure operators can
              digitise waste listing, carrier coordination, and compliance
              documentation.
            </p>

            <ul className="space-y-4 text-gray-700">
              <li>• Structured listing creation</li>
              <li>• Controlled carrier selection</li>
              <li>• Real-time transfer visibility</li>
              <li>• Incident logging capability</li>
              <li>• Digital audit-ready records</li>
            </ul>
          </div>

          <div className="relative h-[400px]">
            <Image
              src="https://images.unsplash.com/photo-1770068511770-827727c2e433?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2FzdGUlMjBtYW5hZ2Vyc3xlbnwwfHwwfHx8MA%3D%3D"
              alt="Construction site manager"
              fill
              sizes="100vw"
              className="object-cover border-4 border-orange-500"
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-28 px-6 bg-orange-500 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">
          Structured Digital Waste Infrastructure
        </h2>
        <p className="text-lg mb-10">
          Built for operational clarity. Designed for regulatory evolution.
        </p>
        <button className="bg-black px-10 py-4 font-semibold hover:bg-gray-900 transition">
          Request Pilot Access
        </button>
      </section>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function Step({ number, title, text }: any) {
  return (
    <div className="border-2 border-gray-200 p-6">
      <div className="text-4xl font-bold text-orange-500 mb-4">{number}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}
