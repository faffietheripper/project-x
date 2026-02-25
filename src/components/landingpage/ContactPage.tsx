"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="relative min-h-screen text-white">
      {/* ================= BACKGROUND IMAGE ================= */}
      <div className="fixed inset-0 -z-20">
        <Image
          src="https://images.unsplash.com/photo-1740635313618-35636018c870?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2FzdGUlMjBkaXNwb3NhbHxlbnwwfHwwfHx8MA%3D%3D"
          alt="Construction operations background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* ================= DARK OVERLAY ================= */}
      <div className="fixed inset-0 -z-10 bg-black/85" />

      {/* ================= CONTENT ================= */}
      <div className="pt-40 pb-36 px-6">
        {/* HEADER */}
        <motion.section
          className="max-w-4xl mx-auto text-center mb-24"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <h1 className="font-[var(--font-heading)] text-6xl tracking-tight mb-6">
            Contact <span className="text-orange-500">Waste X</span>
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Speak with our team regarding operational deployment, regulatory
            alignment, or pilot participation within construction environments.
          </p>
        </motion.section>

        {/* FORM + INFO */}
        <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20">
          {/* FORM */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="bg-black/70 border border-gray-700 p-12 backdrop-blur-md"
          >
            <h2 className="font-[var(--font-heading)] text-3xl tracking-tight mb-10">
              Operational Inquiry
            </h2>

            {submitted ? (
              <div className="border border-orange-500 p-6">
                <p className="text-orange-500 font-medium">
                  Inquiry received. Our team will respond shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-8"
              >
                <Input label="Full Name" type="text" required />
                <Input label="Company Name" type="text" />
                <Input label="Email Address" type="email" required />

                <div>
                  <label className="block text-sm text-gray-300 uppercase tracking-wide mb-3">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full bg-black/80 border border-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-black px-6 py-4 font-semibold uppercase tracking-wide transition"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </motion.div>

          {/* INFO */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="space-y-16"
          >
            <div>
              <h3 className="font-[var(--font-heading)] text-2xl tracking-tight mb-6">
                Enterprise & Regulatory Coordination
              </h3>

              <p className="text-gray-300 leading-relaxed">
                Waste X supports structured waste movement documentation,
                carrier participation, and compliance visibility aligned with
                evolving UK Digital Waste Tracking initiatives.
              </p>
            </div>

            <div className="bg-black/70 border border-gray-700 p-10 backdrop-blur-md space-y-6">
              <InfoRow label="Enterprise" value="enterprise@waste-x.com" />
              <InfoRow label="Support" value="support@waste-x.com" />
              <InfoRow label="Operating Region" value="United Kingdom" />
            </div>

            <div>
              <h3 className="font-[var(--font-heading)] text-2xl tracking-tight mb-6">
                Platform Scope
              </h3>

              <p className="text-gray-300 leading-relaxed">
                The platform provides digital chain-of-custody logging,
                structured listing workflows, carrier verification, completion
                logging, and audit-ready record generation for construction
                waste environments.
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function Input({
  label,
  type,
  required = false,
}: {
  label: string;
  type: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 uppercase tracking-wide mb-3">
        {label}
      </label>
      <input
        type={type}
        required={required}
        className="w-full bg-black/80 border border-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition"
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm uppercase tracking-wide">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
