import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-4 gap-16">
        {/* BRAND */}
        <div className="space-y-6">
          <h2 className="font-[var(--font-heading)] text-3xl tracking-tight">
            Waste<span className="text-orange-500">X</span>
          </h2>

          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            Digital chain-of-custody infrastructure designed for construction
            environments, licensed carriers, and regulatory-aligned waste
            transfer verification.
          </p>

          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Operational Infrastructure · United Kingdom
          </div>
        </div>

        {/* PLATFORM */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-6">
            Platform
          </h3>

          <ul className="space-y-4 text-sm text-gray-400">
            <li>
              <Link
                href="/features"
                className="hover:text-white transition-colors"
              >
                System Overview
              </Link>
            </li>
            <li>
              <Link
                href="/security"
                className="hover:text-white transition-colors"
              >
                Compliance & Security
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="hover:text-white transition-colors"
              >
                Deployment Model
              </Link>
            </li>
          </ul>
        </div>

        {/* INDUSTRY */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-6">
            Industry
          </h3>

          <ul className="space-y-4 text-sm text-gray-400">
            <li>
              <Link
                href="/construction"
                className="hover:text-white transition-colors"
              >
                Construction & Demolition
              </Link>
            </li>
            <li>
              <Link
                href="/carriers"
                className="hover:text-white transition-colors"
              >
                Licensed Carriers
              </Link>
            </li>
            <li>
              <Link
                href="/local-authorities"
                className="hover:text-white transition-colors"
              >
                Local Authorities
              </Link>
            </li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-6">
            Company
          </h3>

          <ul className="space-y-4 text-sm text-gray-400">
            <li>
              <Link
                href="/about"
                className="hover:text-white transition-colors"
              >
                About Waste X
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/legal"
                className="hover:text-white transition-colors"
              >
                Legal & Policies
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Structural Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 uppercase tracking-wider">
          <div>© {new Date().getFullYear()} Waste X · All Rights Reserved</div>

          <div>Digital Waste Transfer Infrastructure</div>
        </div>
      </div>
    </footer>
  );
}
