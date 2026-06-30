"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6 }}
          className="relative mb-8 inline-block"
        >
          <span className="text-[120px] md:text-[180px] font-black leading-none text-foreground/[0.04] select-none">
            404
          </span>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-chart-3/20 to-chart-3/5 flex items-center justify-center border border-chart-3/20">
                  <Search size={32} className="text-chart-3/60" />
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-chart-1/20 flex items-center justify-center"
                >
                  <span className="text-xs">?</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Page Not Found
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. It might have been removed, renamed, or is temporarily unavailable.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild className="h-11 rounded-full px-6 gap-2">
            <Link href="/">
              <Home size={15} />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full px-6 gap-2">
            <Link href="/products">
              <Search size={14} />
              Browse Products
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}