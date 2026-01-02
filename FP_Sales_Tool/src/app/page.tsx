"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full"
      >
        <div className="text-sm uppercase tracking-widest text-white/50 mb-4">First Principle Interactive</div>
        <h1 className="text-5xl md:text-6xl font-semibold leading-tight mb-6">
          Build a portfolio in 90 seconds.<br />
          <span className="text-white/80">Survive three regimes.</span>
        </h1>
        <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-2xl">
          Allocate across fixed income, equities, and structured outcomes. Each level reveals what your choices
          delivered versus what an optimized approach could have achieved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/game"
            className="inline-flex items-center justify-center rounded-xl bg-white text-black px-8 py-4 font-medium hover:bg-white/90 transition-colors text-lg"
          >
            Start the Challenge
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-8 py-4 text-white/80 hover:bg-white/5 hover:border-white/30 transition-colors text-lg"
          >
            Skip to Dashboard
          </Link>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-sm text-white/50 mb-4">
            Learn more about First Principle&apos;s systematic approach to portfolio enhancement:
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/institutional/index.html" target="_blank" className="text-white/70 hover:text-white underline text-sm">
              Our Approach
            </a>
            <a href="/institutional/product.html" target="_blank" className="text-white/70 hover:text-white underline text-sm">
              Strategy Details
            </a>
            <a href="/about.html" target="_blank" className="text-white/70 hover:text-white underline text-sm">
              About Us
            </a>
            <a href="/contact.html" target="_blank" className="text-white/70 hover:text-white underline text-sm">
              Contact
            </a>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <p className="text-sm text-white/40">
            This is a simulation. Past performance does not guarantee future results.
          </p>
        </div>
      </motion.div>
    </main>
  );
}

