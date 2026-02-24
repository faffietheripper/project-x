import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-12">
        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Waste<span className="text-indigo-500">X</span>
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Digital chain of custody infrastructure for compliant waste
            transfers, carrier verification, and operational transparency.
          </p>
        </div>

        {/* COMPANY */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-white/90">Company</h3>
          <ul className="space-y-3 text-sm text-white/60">
            <li>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/careers" className="hover:text-white">
                Careers
              </Link>
            </li>
          </ul>
        </div>

        {/* PRODUCT */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-white/90">Product</h3>
          <ul className="space-y-3 text-sm text-white/60">
            <li>
              <Link href="/features" className="hover:text-white">
                Features
              </Link>
            </li>
            <li>
              <Link href="/security" className="hover:text-white">
                Security
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-white">
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        {/* LEGAL */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-white/90">Legal</h3>
          <ul className="space-y-3 text-sm text-white/60">
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Waste X. All rights reserved.
      </div>
    </footer>
  );
}
