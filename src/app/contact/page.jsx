"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from "lucide-react";
import { EASE_OUT } from "@/lib/ease";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email Us",
    value: "support@kino.com",
    href: "mailto:support@kino.com",
    desc: "We reply within 24 hours",
    color: "text-chart-3",
    bg: "from-chart-3/15 to-chart-3/5",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+880 1700-000000",
    href: "tel:+8801700000000",
    desc: "Sat–Thu, 9 AM – 8 PM BST",
    color: "text-chart-1",
    bg: "from-chart-1/15 to-chart-1/5",
  },
  {
    icon: MapPin,
    label: "Visit Us",
    value: "Dhaka, Bangladesh",
    href: null,
    desc: "Mirpur DOHS, Dhaka 1216",
    color: "text-chart-2",
    bg: "from-chart-2/15 to-chart-2/5",
  },
  {
    icon: MessageSquare,
    label: "Live Chat",
    value: "Available Now",
    href: null,
    desc: "Avg. response time: 5 min",
    color: "text-chart-4",
    bg: "from-chart-4/15 to-chart-4/5",
  },
];

const FAQS = [
  {
    q: "How do I list a product for sale?",
    a: "Sign up as a seller, go to your Seller Dashboard, click 'Add Product', upload images, set your price, and publish. Your listing goes live instantly after review.",
  },
  {
    q: "Is it safe to buy on Kino.com?",
    a: "Absolutely. All payments are processed securely through Stripe. We also have a review system and seller verification to maintain marketplace quality.",
  },
  {
    q: "How does delivery work?",
    a: "After your payment is confirmed, the seller will process and ship your order. You can track the order status in real-time from your Buyer Dashboard.",
  },
  {
    q: "Can I cancel an order?",
    a: "Yes, buyers can cancel orders that are still in 'Pending' status. Go to My Orders, find the order, and click Cancel. Once accepted by the seller, cancellation requires their approval.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Message sent successfully! We'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-linear-to-br from-background via-muted/30 to-background" />
        <div className="absolute -top-20 left-1/3 h-80 w-80 rounded-full bg-chart-3/10 blur-[80px]" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <MessageSquare size={12} className="text-chart-3" />
            Get In Touch
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-tight"
          >
            Contact <span className="text-chart-3">Us</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Have a question, feedback, or need help? We&apos;d love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTACT_INFO.map(({ icon: Icon, label, value, href, desc, color, bg }, i) => {
              const Wrapper = href ? "a" : "div";
              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.08 }}
                  whileHover={{ y: -4, transition: { duration: 0.25 } }}
                >
                  <Wrapper
                    {...(href ? { href } : {})}
                    className="group flex flex-col rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 cursor-pointer h-full"
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${bg} ${color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={20} strokeWidth={1.5} />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </Wrapper>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact form + info */}
      <section className="py-16 md:py-20 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="lg:col-span-3"
            >
              <div className="rounded-2xl border border-border/50 bg-card p-8">
                <h2 className="text-xl font-black text-foreground mb-1">Send a Message</h2>
                <p className="text-sm text-muted-foreground mb-8">Fill out the form and we&apos;ll respond within 24 hours.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Name <span className="text-destructive">*</span></Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Your full name"
                        className="bg-background"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Email <span className="text-destructive">*</span></Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="you@example.com"
                        className="bg-background"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Subject</Label>
                    <Input
                      value={form.subject}
                      onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                      placeholder="What is this about?"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Message <span className="text-destructive">*</span></Label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Tell us how we can help..."
                      rows={5}
                      className="bg-background resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full h-11 gap-2"
                  >
                    {submitting ? "Sending..." : <><Send size={14} /> Send Message</>}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Side info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="rounded-2xl border border-border/50 bg-card p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-3/15 text-chart-3">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Business Hours</p>
                    <p className="text-xs text-muted-foreground">Sat – Thu, 9 AM – 8 PM BST</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-1/15 text-chart-1">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Service Area</p>
                    <p className="text-xs text-muted-foreground">All 64 districts of Bangladesh</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our support team is available 6 days a week. For urgent issues, please call our hotline directly for the fastest response.
                </p>
              </div>

              {/* Mini FAQ */}
              <div className="rounded-2xl border border-border/50 bg-card p-7">
                <h3 className="text-sm font-bold text-foreground mb-5">Frequently Asked</h3>
                <div className="space-y-4">
                  {FAQS.slice(0, 3).map(({ q, a }, i) => (
                    <div key={i} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                      <p className="text-xs font-bold text-foreground mb-1">{q}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}