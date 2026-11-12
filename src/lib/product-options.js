/**
 * Single source of truth for product categories, conditions and statuses.
 * Category names must match the stored `products.category` values exactly
 * (see docs/product-schema-and-seller-snapshot.md §1c).
 */
import {
  Armchair,
  BookOpen,
  Briefcase,
  Camera,
  Car,
  CookingPot,
  Cpu,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Headphones,
  Keyboard,
  Laptop,
  Mouse,
  Package,
  Shirt,
  Smartphone,
  Sparkles,
} from "lucide-react";

// Tailwind only generates classes it can find as complete literal strings, so
// every tone is spelled out in full instead of being built from the index.
const TONES = {
  1: { color: "text-chart-1", bg: "from-chart-1/15 to-chart-1/5", navBg: "bg-chart-1/10", border: "hover:border-chart-1/30" },
  2: { color: "text-chart-2", bg: "from-chart-2/15 to-chart-2/5", navBg: "bg-chart-2/10", border: "hover:border-chart-2/30" },
  3: { color: "text-chart-3", bg: "from-chart-3/15 to-chart-3/5", navBg: "bg-chart-3/10", border: "hover:border-chart-3/30" },
  4: { color: "text-chart-4", bg: "from-chart-4/15 to-chart-4/5", navBg: "bg-chart-4/10", border: "hover:border-chart-4/30" },
  5: { color: "text-chart-5", bg: "from-chart-5/15 to-chart-5/5", navBg: "bg-chart-5/10", border: "hover:border-chart-5/30" },
};

/**
 * `desc` is the short blurb (home grid), `longDesc` the /categories page copy.
 * `count` is display-only marketing copy, not a real product count.
 */
export const CATEGORIES = [
  { name: "Electronics",              icon: Cpu,           ...TONES[1], count: "2.5k+", desc: "TVs, audio, tablets",          longDesc: "TVs, headphones, tablets, smart devices & more" },
  { name: "Mobile Phones",            icon: Smartphone,    ...TONES[5], count: "1.8k+", desc: "Smartphones & tablets",        longDesc: "Smartphones, feature phones & tablets" },
  { name: "Mobile Accessories",       icon: Headphones,    ...TONES[2], count: "1.1k+", desc: "Chargers, cases, earbuds",     longDesc: "Chargers, cables, cases, earbuds & power banks" },
  { name: "PC & Laptops",             icon: Laptop,        ...TONES[3], count: "1.6k+", desc: "Laptops, desktops, MacBooks",  longDesc: "Laptops, desktops, MacBooks & workstations" },
  { name: "PC & Laptops Gadgets",     icon: Mouse,         ...TONES[4], count: "780+",  desc: "Mice, webcams, drives",        longDesc: "Mice, webcams, external drives, docks & more" },
  { name: "PC & Laptop Accessories",  icon: Keyboard,      ...TONES[5], count: "860+",  desc: "Monitors, keyboards, bags",    longDesc: "Monitors, keyboards, laptop bags, stands & cooling pads" },
  { name: "Furniture",                icon: Armchair,      ...TONES[2], count: "1.2k+", desc: "Tables, chairs, sofas",        longDesc: "Tables, chairs, sofas, beds & storage" },
  { name: "Vehicles",                 icon: Car,           ...TONES[3], count: "890+",  desc: "Cars, bikes, accessories",     longDesc: "Cars, bikes, cycles & accessories" },
  { name: "Fashion, Beauty & Care",   icon: Sparkles,      ...TONES[4], count: "1.4k+", desc: "Shoes, bags, beauty",          longDesc: "Shoes, bags, watches, jewellery, cosmetics & personal care" },
  { name: "Home & Kitchen",           icon: CookingPot,    ...TONES[1], count: "920+",  desc: "Appliances, cookware, decor",  longDesc: "Kitchen appliances, cookware, home decor & essentials" },
  { name: "Clothing & Garments",      icon: Shirt,         ...TONES[5], count: "1.7k+", desc: "Sarees, shirts, panjabis",     longDesc: "Sarees, salwar kameez, shirts, panjabis & winterwear" },
  { name: "Books",                    icon: BookOpen,      ...TONES[1], count: "640+",  desc: "Textbooks, novels, guides",    longDesc: "Textbooks, novels, guides & magazines" },
  { name: "Sports & Fitness",         icon: Dumbbell,      ...TONES[3], count: "720+",  desc: "Gym gear, outdoor & sportswear", longDesc: "Gym equipment, outdoor gear & sportswear" },
  { name: "Gaming",                   icon: Gamepad2,      ...TONES[5], count: "950+",  desc: "Consoles, games, controllers", longDesc: "Consoles, games, controllers & setups" },
  { name: "Cameras",                  icon: Camera,        ...TONES[2], count: "410+",  desc: "Cameras, lenses, accessories", longDesc: "DSLRs, lenses, tripods & accessories" },
  { name: "Education",                icon: GraduationCap, ...TONES[4], count: "530+",  desc: "Study materials & supplies",   longDesc: "Study materials, instruments & supplies" },
  { name: "Jobs & Services",          icon: Briefcase,     ...TONES[1], count: "300+",  desc: "Office tools & services",      longDesc: "Office equipment, tools & services" },
  { name: "Others",                   icon: Package,       ...TONES[2], count: "400+",  desc: "Everything else",              longDesc: "Everything that doesn't fit elsewhere" },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

export function categoryHref(name) {
  return `/products?category=${encodeURIComponent(name)}`;
}

export const CONDITIONS = ["New", "Like New", "Excellent", "Good", "Fair", "Used", "Refurbished"];

export const CONDITION_COLOR = {
  New: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  "Like New": "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Excellent: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Good: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Fair: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Used: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Refurbished: "bg-chart-1/10 text-chart-1 border-chart-1/20",
};

export const CONDITION_FALLBACK = "bg-muted text-muted-foreground border-border";

/** `rejected` = taken down by an admin; Approve restores it to `available`. */
export const PRODUCT_STATUSES = ["pending", "available", "sold", "rejected"];
