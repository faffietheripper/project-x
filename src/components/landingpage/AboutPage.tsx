"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function AboutPage() {
  return (
    <main className="bg-white text-gray-900">
      {/* ================= HERO ================= */}
      <section className="relative bg-[#1f1f1f] text-white px-6 py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="relative h-[420px]"
          >
            <Image
              src="https://images.unsplash.com/photo-1711618734168-9935518143a4?auto=format&fit=crop&w=1600&q=80"
              alt="Construction waste operations"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover border-4 border-orange-500"
            />
          </motion.div>

          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Why Waste X Exists
            </h1>

            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              Waste X was created to bring structure and accountability to
              construction-grade waste operations across the United Kingdom.
            </p>

            <p className="text-gray-400 mb-10 leading-relaxed">
              As regulatory oversight increases and digital waste tracking
              evolves, fragmented systems are no longer sustainable.
              Infrastructure is required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= INDUSTRY SHIFT ================= */}
      <section className="py-28 px-6 bg-gray-100 border-t-8 border-orange-500">
        <div className="max-w-5xl mx-auto text-center space-y-6 mb-16">
          <h2 className="text-4xl font-bold">The Industry Is Changing</h2>

          <p className="text-lg text-gray-600 leading-relaxed">
            Construction and demolition projects generate significant material
            movement across sites, regions, and organisations.
          </p>

          <p className="text-lg text-gray-600 leading-relaxed">
            The shift toward UK Digital Waste Tracking represents a structural
            transformation — from paper-based processes to accountable digital
            systems.
          </p>
        </div>

        {/* Added Image Row */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="relative h-[260px]">
            <Image
              src="https://images.unsplash.com/photo-1574974671999-24b7dfbb0d53?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2FzdGUlMjBtYW5hZ2VtZW50fGVufDB8fDB8fHww"
              alt="Construction site logistics"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover border border-gray-300"
            />
          </div>

          <div className="relative h-[260px]">
            <Image
              src="https://images.unsplash.com/photo-1722482445685-91a6b17d5d02?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHdhc3RlJTIwbWFuYWdlbWVudHxlbnwwfHwwfHx8MA%3D%3D"
              alt="Material handling"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover border border-gray-300"
            />
          </div>

          <div className="relative h-[260px]">
            <Image
              src="https://images.unsplash.com/photo-1717667745836-145a38948ebf?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHdhc3RlJTIwbWFuYWdlbWVudHxlbnwwfHwwfHx8MA%3D%3D"
              alt="Waste site management"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover border border-gray-300"
            />
          </div>
        </div>
      </section>

      {/* ================= FOUNDATIONAL PROBLEMS ================= */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 mb-20">
          <IndustrialCard
            title="Fragmented Workflows"
            text="Spreadsheets, emails and disconnected systems create inefficiency and audit gaps."
          />
          <IndustrialCard
            title="Verification Challenges"
            text="Manual assignment and collection confirmation increases operational risk."
          />
          <IndustrialCard
            title="Regulatory Exposure"
            text="Environmental accountability standards are increasing across the UK."
          />
        </div>

        {/* Added Supporting Image */}
        <div className="max-w-6xl mx-auto relative h-[400px]">
          <Image
            src="https://images.unsplash.com/photo-1528323273322-d81458248d40?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHdhc3RlJTIwbWFuYWdlbWVudHxlbnwwfHwwfHx8MA%3D%3D"
            alt="Construction waste transport"
            fill
            sizes="100vw"
            className="object-cover border border-gray-300"
          />
        </div>
      </section>

      {/* ================= SYSTEM ARCHITECTURE ================= */}
      <section className="py-32 px-6 bg-gray-50 border-t-4 border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-20">
            The Infrastructure Approach
          </h2>

          <div className="grid md:grid-cols-5 gap-8 text-center">
            <ProcessStep
              number="01"
              title="Structured Listing"
              description="Waste details recorded digitally at source."
            />
            <Arrow />
            <ProcessStep
              number="02"
              title="Carrier Bidding"
              description="Verified carriers submit controlled offers."
            />
            <Arrow />
            <ProcessStep
              number="03"
              title="Assignment"
              description="Producer confirms selected carrier."
            />
          </div>

          <div className="grid md:grid-cols-5 gap-8 text-center mt-10">
            <ProcessStep
              number="04"
              title="Collection Logging"
              description="Carrier confirms transfer within system."
            />
            <Arrow />
            <ProcessStep
              number="05"
              title="Audit Record"
              description="Complete digital trail generated."
            />
          </div>
        </div>
      </section>

      {/* ================= WHO IT'S FOR ================= */}
      <section className="py-32 px-6 bg-[#2b2b2b] text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <SideBlock
            title="Built for Waste Producers"
            description="Contractors, developers and infrastructure operators managing multiple waste streams."
            items={[
              "Centralised waste listings",
              "Carrier selection control",
              "Incident documentation logs",
              "Organisational data segmentation",
              "Transfer verification workflows",
            ]}
          />

          {/* Added Image */}
          <div className="relative h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1600295168769-f5bc53f93b27?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2FzdGUlMjBkaXNwb3NhbHxlbnwwfHwwfHx8MA%3D%3D"
              alt="Site manager using tablet"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover border-4 border-orange-500"
            />
          </div>
        </div>
      </section>

      {/* ================= LONG TERM VISION ================= */}
      <section className="py-32 px-6 bg-white border-t-8 border-orange-500">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold">
            Built for Long-Term Infrastructure
          </h2>

          <p className="text-lg text-gray-600 leading-relaxed">
            Waste X is structured digital infrastructure designed to support the
            evolving regulatory and operational direction of the UK waste
            sector.
          </p>

          <p className="text-lg text-gray-600 leading-relaxed">
            Compliance should not sit outside operations. It should be embedded
            within them.
          </p>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-28 px-6 bg-orange-500 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">
          Operationally Structured. Regulatory Ready.
        </h2>

        <p className="text-lg mb-10">
          Digital infrastructure for modern construction waste operations.
        </p>

        <button className="bg-black px-10 py-4 font-semibold hover:bg-gray-900 transition">
          Request Pilot Access
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
