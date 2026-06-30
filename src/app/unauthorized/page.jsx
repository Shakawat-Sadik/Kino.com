"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { ShieldX, Home, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
          className="mx-auto mb-8 relative"
        >
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center border border-destructive/20 mx-auto">
            <ShieldX size={40} className="text-destructive/80" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-4 rounded-[2rem] bg-destructive/5 blur-xl -z-10"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-2xl md:text-3xl font-black text-foreground tracking-tight"
        >
          Access Denied
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-4 text-sm text-muted-foreground leading-relaxed"
        >
          You don&apos;t have permission to access this page. This area is restricted to authorized users with the correct role. If you believe this is an error, please contact support.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild className="h-11 rounded-full px-6 gap-2">
            <Link href="/">
              <Home size={15} />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full px-6 gap-2">
            <Link href="/auth/login">
              <ArrowLeft size={14} />
              Sign In
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-xs text-muted-foreground/60"
        >
          Error code: 403 — Forbidden
        </motion.p>
      </div>
    </div>
  );
}