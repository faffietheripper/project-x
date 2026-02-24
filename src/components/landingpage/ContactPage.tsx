"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="bg-black text-white min-h-screen pt-40 pb-32 px-6">
      {/* ================= HEADER ================= */}
      <motion.section
        className="max-w-4xl mx-auto text-center mb-20"
        initial="hidden"
        animate="show"
        variants={fadeUp}
      >
        <h1 className="text-5xl font-bold mb-6">
          Contact <span className="text-indigo-500">Waste X</span>
        </h1>

        <p className="text-white/70 text-lg leading-relaxed">
          Speak with our team about enterprise deployment, regulatory alignment,
          or partnership opportunities.
        </p>
      </motion.section>

      {/* ================= FORM + INFO ================= */}
      <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
        {/* CONTACT FORM */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-white/5 border border-white/10 p-10 rounded-2xl"
        >
          <h2 className="text-2xl font-semibold mb-8">Send Us a Message</h2>

          {submitted ? (
            <div className="bg-green-600/20 border border-green-500 p-6 rounded-xl">
              <p className="text-green-400 font-medium">
                Thank you. Our team will respond shortly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-6"
            >
              <Input label="Full Name" type="text" required />
              <Input label="Company Name" type="text" />
              <Input label="Email Address" type="email" required />

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 px-6 py-4 rounded-lg font-medium transition"
              >
                Submit Inquiry
              </button>
            </form>
          )}
        </motion.div>

        {/* CONTACT INFO */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="space-y-10"
        >
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Enterprise & Regulatory Inquiries
            </h3>
            <p className="text-white/70 leading-relaxed">
              For large-scale deployment, regulatory partnerships, or
              integration discussions, please contact our enterprise team
              directly.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-4">
            <InfoRow label="Email" value="enterprise@waste-x.com" />
            <InfoRow label="General Support" value="support@waste-x.com" />
            <InfoRow label="Location" value="United Kingdom" />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Platform Overview</h3>
            <p className="text-white/70 leading-relaxed">
              Waste X provides digital infrastructure for structured waste
              auctions, carrier verification, incident management, and
              compliance tracking aligned with emerging UK Digital Waste
              Tracking standards.
            </p>
          </div>
        </motion.div>
      </section>
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
      <label className="block text-sm text-white/70 mb-2">{label}</label>
      <input
        type={type}
        required={required}
        className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/50">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
