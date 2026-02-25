"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function FullHomePage() {
  return (
    <main className="bg-white text-gray-900">
      {/* ================= HERO ================= */}
      <section className="relative bg-[#1f1f1f] text-white px-6 py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Digital Infrastructure for
              <span className="text-orange-500"> Modern Waste Operations</span>
            </h1>

            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              Waste X provides structured digital workflows for waste producers,
              carriers, and compliance teams operating in high-volume,
              construction-grade environments.
            </p>

            <p className="text-gray-400 mb-10 leading-relaxed">
              From listing and bidding to assignment, collection verification,
              and incident management — every stage of the transfer is recorded,
              structured, and auditable.
            </p>

            <div className="flex gap-4">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 font-semibold transition">
                Create Organisation
              </button>
              <button className="border border-white/30 px-8 py-4 hover:bg-white/10 transition">
                View Platform Overview
              </button>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="relative h-[420px]"
          >
            <Image
              src="https://images.unsplash.com/photo-1711618732595-0c517e08d40c?q=80&w=2906&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Construction operations"
              fill
              className="object-cover border-4 border-orange-500"
            />
          </motion.div>
        </div>
      </section>

      {/* ================= INDUSTRY CONTEXT ================= */}
      <section className="py-28 px-6 bg-gray-100 border-t-8 border-orange-500">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold">
            Waste Transfers Are Operationally Complex
          </h2>

          <p className="text-lg text-gray-600 leading-relaxed">
            Construction and infrastructure projects generate significant
            material movement. Each transfer involves coordination between
            producers, licensed carriers, and receiving facilities — often
            across multiple regions and compliance frameworks.
          </p>

          <p className="text-lg text-gray-600 leading-relaxed">
            As UK Digital Waste Tracking progresses, organisations will need
            systems that support traceability, accountability, and structured
            documentation from the start.
          </p>
        </div>
      </section>

      {/* ================= KEY RISKS ================= */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <IndustrialCard
            title="Unstructured Communication"
            text="Phone calls, spreadsheets and fragmented documentation increase operational risk and reduce audit visibility."
          />

          <IndustrialCard
            title="Carrier Verification Gaps"
            text="Without structured digital processes, organisations lack clear oversight over bidding, assignment, and collection confirmation."
          />

          <IndustrialCard
            title="Regulatory Exposure"
            text="Increasing environmental oversight requires digital audit trails across every stage of the waste lifecycle."
          />
        </div>
      </section>

      {/* ================= WHY WASTE X ================= */}
      <section className="relative py-40 text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1642204705127-accc0dcc5779?auto=format&fit=crop&w=2000&q=80"
            alt="Construction waste background"
            fill
            sizes="100vw"
            className="object-cover scale-110"
            priority={false}
          />
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
            Why <span className="text-orange-500">Waste X</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-16">
            <BenefitBlock
              title="Improve Operational ROI"
              text="Using spreadsheets and paper documentation to manage waste transfers results in missing loads, reconciliation delays, and untracked costs. Waste X creates a real-time digital record of every transfer, providing a single, accurate system of record."
            />

            <BenefitBlock
              title="Maintain Quantity & Cost Control"
              text="When volumes and haulage costs aren’t visible immediately, overruns go unnoticed until it's too late. Waste X compares expected volumes against logged transfers in real time, helping identify discrepancies early."
            />

            <BenefitBlock
              title="Verify Invoices & Reduce Risk"
              text="Manual reconciliation increases the risk of billing errors and disputes. Waste X provides structured, transfer-level data to validate invoices quickly and reduce exposure."
            />

            <BenefitBlock
              title="Monitor Carrier Performance"
              text="Without structured performance data, it’s difficult to identify inefficiencies. Waste X tracks participation, assignment, and completion activity — providing clarity without intrusive tracking methods."
            />
          </div>
        </div>
      </section>

      {/* ================= FOR PRODUCERS & CARRIERS ================= */}
      <section className="py-32 px-6 bg-[#2b2b2b] text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20">
          <SideBlock
            title="Waste Producers"
            description="Designed for contractors, developers, and site managers managing multiple waste streams."
            items={[
              "Centralised waste listing management",
              "Controlled carrier selection",
              "Incident documentation & resolution logs",
              "Organisational data segmentation",
              "Transfer verification workflows",
            ]}
          />

          <SideBlock
            title="Waste Carriers"
            description="Built for licensed carriers operating across regions and projects."
            items={[
              "Access to structured bid opportunities",
              "Clear assignment tracking",
              "Collection verification system",
              "Incident reporting tools",
              "Operational audit history",
            ]}
          />
        </div>
      </section>

      {/* ================= COMPLIANCE ================= */}
      <section className="py-32 px-6 bg-white border-t-8 border-yellow-500">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold">
            Regulatory-Ready Infrastructure
          </h2>

          <p className="text-lg text-gray-600 leading-relaxed">
            Waste X is structured to support digital audit trails, verification
            checkpoints, and organisational scoping — preparing businesses for
            the evolution of UK Digital Waste Tracking and increasing
            environmental accountability standards.
          </p>

          <p className="text-lg text-gray-600 leading-relaxed">
            Compliance should not sit outside operations. It should be embedded
            directly within them.
          </p>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-28 px-6 bg-orange-500 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">
          Construction-Grade Digital Waste Infrastructure
        </h2>

        <p className="text-lg mb-10">
          Built for operational clarity. Structured for regulatory evolution.
        </p>

        <button className="bg-black px-10 py-4 font-semibold hover:bg-gray-900 transition">
          Start Your Organisation
        </button>
      </section>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function IndustrialCard({ title, text }: any) {
  return (
    <div className="border-2 border-gray-200 p-8 shadow-sm">
      <h3 className="text-xl font-bold mb-4 text-orange-500">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

function ProcessStep({ number, title, description }: any) {
  return (
    <div className="border-2 border-gray-200 p-6">
      <div className="text-4xl font-bold text-orange-500 mb-3">{number}</div>
      <div className="font-semibold mb-2">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden md:flex items-center justify-center text-3xl text-gray-400">
      →
    </div>
  );
}

function SideBlock({ title, description, items }: any) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-orange-500">{title}</h3>
      <p className="text-gray-300 mb-8">{description}</p>
      <ul className="space-y-4 text-gray-300">
        {items.map((item: string, i: number) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function BenefitBlock({ title, text }: any) {
  return (
    <div className="border border-white/20 p-10 backdrop-blur-sm bg-black/40">
      <h3 className="text-2xl font-bold text-orange-500 mb-6">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{text}</p>
    </div>
  );
}
