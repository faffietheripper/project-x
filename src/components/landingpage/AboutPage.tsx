"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function AboutPage() {
  return (
    <main className="bg-black text-white min-h-screen pt-40 pb-32 px-6">
      {/* ================= HERO ================= */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="max-w-4xl mx-auto text-center mb-24"
      >
        <h1 className="text-5xl font-bold mb-6">
          Why <span className="text-indigo-500">Waste X</span> Exists
        </h1>

        <p className="text-lg text-white/70 leading-relaxed">
          Waste X wasn’t built to be another marketplace. It was built to bring
          structure, visibility, and accountability to an industry that is
          becoming increasingly regulated — and increasingly complex.
        </p>
      </motion.section>

      {/* ================= STORY ================= */}
      <section className="max-w-5xl mx-auto space-y-12 text-white/80 leading-relaxed text-lg">
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Waste management operations are rarely simple. Transfers involve
          multiple organisations, carriers, compliance requirements,
          documentation, verification, and trust between parties.
        </motion.p>

        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Yet much of the industry still relies on fragmented communication,
          spreadsheets, phone calls, and disconnected systems. As regulatory
          frameworks evolve — particularly with the UK’s move toward Digital
          Waste Tracking — the need for structured, digital infrastructure
          becomes unavoidable.
        </motion.p>

        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Waste X was created to address that gap. Not by replacing human
          relationships, but by supporting them with better systems.
        </motion.p>
      </section>

      {/* ================= MISSION ================= */}
      <section className="mt-32 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>

          <p className="text-white/70 leading-relaxed">
            To provide secure, structured digital infrastructure for waste
            transfers — ensuring that every listing, bid, assignment,
            verification, and incident is properly recorded and auditable.
          </p>

          <p className="mt-6 text-white/70 leading-relaxed">
            We believe compliance should not be an afterthought. It should be
            built into the workflow from the start.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-white/5 border border-white/10 p-10 rounded-2xl"
        >
          <ul className="space-y-6 text-white/80">
            <li>• Structured digital waste listings</li>
            <li>• Verified organisation participation</li>
            <li>• Carrier assignment tracking</li>
            <li>• Incident documentation & resolution</li>
            <li>• Organisation-scoped data security</li>
          </ul>
        </motion.div>
      </section>

      {/* ================= INDUSTRY CONTEXT ================= */}
      <section className="mt-32 max-w-5xl mx-auto space-y-10 text-white/70 leading-relaxed text-lg">
        <motion.h2
          className="text-3xl font-bold text-white mb-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          The Direction of the Industry
        </motion.h2>

        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          The UK government’s commitment to digital waste tracking signals a
          broader shift toward transparency and accountability across the
          sector. Environmental impact, ESG reporting, and chain-of-custody
          clarity are no longer optional considerations.
        </motion.p>

        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Waste X is built with that future in mind — not as a temporary tool,
          but as infrastructure that can support long-term regulatory alignment.
        </motion.p>
      </section>

      {/* ================= VALUES ================= */}
      <section className="mt-32 bg-white text-black py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-16 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-4">Integrity</h3>
            <p className="text-gray-600">
              Clear documentation and structured workflows reduce ambiguity and
              protect all parties involved.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Accountability</h3>
            <p className="text-gray-600">
              Every action within the system is traceable, ensuring transparent
              responsibility.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Sustainability</h3>
            <p className="text-gray-600">
              Digital infrastructure supports more responsible environmental
              practices across the supply chain.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CLOSING ================= */}
      <section className="py-24 text-center max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">Built for the Long Term</h2>

        <p className="text-white/70 text-lg leading-relaxed">
          Waste X is not focused on rapid hype-driven growth. It is focused on
          building dependable systems that organisations can trust as regulatory
          requirements evolve.
        </p>
      </section>
    </main>
  );
}
