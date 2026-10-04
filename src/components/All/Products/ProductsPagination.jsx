"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SpecializedPagination } from "@/components/All/dashboard/shared/SpecializedPagination";

export default function ProductsPagination({ page, total, limit }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onPageChange = (next) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    const qs = params.toString();
    // default scroll (jump to top) is desirable on page change
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <SpecializedPagination
      page={page}
      total={total}
      limit={limit}
      onPageChange={onPageChange}
    />
  );
}
