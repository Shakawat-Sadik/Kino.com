"use client";
import { useState } from "react";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }) {
  const [hoveredId, setHoveredId] = useState(null);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard
          key={p._id}
          product={p}
          index={i}
          dimmed={hoveredId !== null && hoveredId !== p._id}
          onHoverStart={() => setHoveredId(p._id)}
          onHoverEnd={() => setHoveredId(null)}
        />
      ))}
    </div>
  );
}
