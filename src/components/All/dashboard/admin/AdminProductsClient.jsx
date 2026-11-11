"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  updateAdminProduct,
  updateProductStatus,
  deleteAdminProduct,
} from "@/lib/action/action";
import { StatusBadge } from "@/components/All/dashboard/shared/StatusBadge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { StatefulButton } from "@/components/motion/button/stateful";
import {
  Package,
  Search,
  X,
  CheckCircle,
  ShieldOff,
  Trash2,
  Pencil,
  Tag,
  DollarSign,
  AlignLeft,
  Eye,
  Store,
  Mail,
} from "lucide-react";
import { SpecializedPagination } from "@/components/All/dashboard/shared/SpecializedPagination";

const CATEGORIES = [
  "All",
  "Electronics",
  "Mobile Phones",
  "Furniture",
  "Vehicles",
  "Fashion",
  "Books",
  "Sports & Fitness",
  "Gaming",
  "Cameras",
  "Education",
  "Jobs & Services",
  "Music",
  "Others",
];
const EDIT_CATEGORIES = CATEGORIES.filter((c) => c !== "All");
const CONDITIONS = ["Used", "Like New", "Refurbished"];
const STATUSES = ["All", "pending", "available", "sold", "rejected"];

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
      <div className="mt-0.5 p-1.5 rounded-lg bg-muted shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground break-all">{value || "—"}</p>
      </div>
    </div>
  );
}

export function AdminProductsClient({
  initialProducts,
  initialTotal,
  initialPage,
  initialCategoryFilter,
  initialStatusFilter,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [busy, setBusy] = useState(null);
  const [search, setSearch] = useState("");

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    description: "",
  });
  const [editState, setEditState] = useState("idle");

  const [viewTargetId, setViewTargetId] = useState(null);
  const viewTarget = products.find((p) => p._id === viewTargetId) || null;

  useEffect(() => {
    setProducts(initialProducts);
    setTotal(initialTotal);
    setSearch("");
  }, [initialProducts, initialTotal]);

  const pushFilters = (overrides) => {
    const next = {
      page: String(initialPage),
      category: initialCategoryFilter,
      status: initialStatusFilter,
      ...overrides,
    };
    const sp = new URLSearchParams();
    if (next.page !== "1") sp.set("page", next.page);
    if (next.category !== "All") sp.set("category", next.category);
    if (next.status !== "All") sp.set("status", next.status);
    router.push(`?${sp.toString()}`);
  };

  const openEdit = (product) => {
    setEditForm({
      title: product.title || "",
      category: product.category || EDIT_CATEGORIES[0],
      condition: product.condition || CONDITIONS[0],
      price: product.price != null ? String(product.price) : "",
      description: product.description || "",
    });
    setEditTarget(product);
    setEditState("idle");
    setViewTargetId(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (editState === "loading") return;
    setEditState("loading");
    const res = await updateAdminProduct(editTarget._id, {
      ...editForm,
      price: editForm.price !== "" ? Number(editForm.price) : undefined,
    });
    if (res.success) {
      setEditState("success");
      toast.success("Product updated");
      setProducts((prev) =>
        prev.map((p) =>
          p._id === editTarget._id
            ? { ...p, ...editForm, price: Number(editForm.price) }
            : p
        )
      );
      setTimeout(() => setEditTarget(null), 800);
    } else {
      setEditState("error");
      toast.error(res.message || "Failed to update product");
      setTimeout(() => setEditState("idle"), 2000);
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    setBusy(productId);
    const res = await updateProductStatus(productId, newStatus);
    if (res.success) {
      toast.success(newStatus === "available" ? "Product approved" : "Product rejected");
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, status: newStatus } : p))
      );
    } else {
      toast.error(res.message || "Failed to update product status");
    }
    setBusy(null);
  };

  const handleDelete = async (productId) => {
    setBusy(productId);
    const res = await deleteAdminProduct(productId);
    if (res.success) {
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      setViewTargetId((prev) => (prev === productId ? null : prev));
    } else {
      toast.error(res.message || "Failed to delete product");
    }
    setBusy(null);
  };

  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      (p.sellerInfo?.name || p.sellerName)?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or seller..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select
          value={initialCategoryFilter}
          onValueChange={(val) => pushFilters({ category: val, page: "1" })}
        >
          <SelectTrigger className="w-full sm:w-44 bg-card">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={initialStatusFilter}
          onValueChange={(val) => pushFilters({ status: val, page: "1" })}
        >
          <SelectTrigger className="w-full sm:w-36 bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                <span className="capitalize">{s}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No products found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || initialCategoryFilter !== "All" || initialStatusFilter !== "All"
                ? "Try changing your filters"
                : "No products listed yet"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground pl-5">Product</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Category</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Condition</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Price</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Seller</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {filtered.map((product, i) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="border-border"
                  >
                    <TableCell className="pl-5 py-4">
                      <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                        {product.title}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{product.category || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground capitalize">{product.condition || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-foreground">
                        ৳{product.price?.toLocaleString() ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground truncate max-w-[110px]">
                        {product.sellerInfo?.name || product.sellerName || "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex items-center justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => setViewTargetId(product._id)}
                        >
                          <Eye className="h-3 w-3" />
                          Action
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}

        <SpecializedPagination
          page={initialPage}
          total={total}
          limit={10}
          onPageChange={(n) => pushFilters({ page: String(n) })}
        />
      </div>

      {/* View product dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(open) => { if (!open) setViewTargetId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Product Details
            </DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <>
              <div className="space-y-0.5">
                <DetailRow icon={Tag} label="Title" value={viewTarget.title} />
                <DetailRow icon={DollarSign} label="Price" value={viewTarget.price != null ? `৳${viewTarget.price.toLocaleString()}` : ""} />
                <DetailRow icon={Package} label="Category" value={viewTarget.category} />
                <DetailRow icon={AlignLeft} label="Description" value={viewTarget.description} />
                <DetailRow icon={Store} label="Seller Name" value={viewTarget.sellerInfo?.name || viewTarget.sellerName} />
                <DetailRow icon={Mail} label="Seller Email" value={viewTarget.sellerInfo?.email || viewTarget.sellerEmail} />
                <div className="flex items-center gap-3 py-2.5">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-muted shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Status</p>
                    <StatusBadge status={viewTarget.status} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1"
                  disabled={busy === viewTarget._id}
                  onClick={() => openEdit(viewTarget)}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>

                {viewTarget.status !== "available" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1 text-green-600 border-green-500/30 hover:bg-green-500/10"
                    disabled={busy === viewTarget._id}
                    onClick={() => handleStatusChange(viewTarget._id, "available")}
                  >
                    <CheckCircle className="h-3 w-3" />
                    Approve
                  </Button>
                )}

                {viewTarget.status !== "rejected" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/10"
                    disabled={busy === viewTarget._id}
                    onClick={() => handleStatusChange(viewTarget._id, "rejected")}
                  >
                    <ShieldOff className="h-3 w-3" />
                    Reject
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1 text-red-500 border-red-500/30 hover:bg-red-500/10"
                      disabled={busy === viewTarget._id}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &ldquo;{viewTarget.title}&rdquo; will be permanently removed. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(viewTarget._id)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit product dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Product</DialogTitle>
            {editTarget && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                Listed by {editTarget.sellerInfo?.name || editTarget.sellerName || "unknown seller"}
              </p>
            )}
          </DialogHeader>
          <Separator />
          <form onSubmit={handleEditSave} className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="flex items-center gap-1.5 text-xs">
                <Tag className="h-3.5 w-3.5" /> Title
              </Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Product title"
                className="bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-xs">Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(val) => setEditForm((p) => ({ ...p, category: val }))}
                >
                  <SelectTrigger id="edit-category" className="bg-background">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDIT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-condition" className="text-xs">Condition</Label>
                <Select
                  value={editForm.condition}
                  onValueChange={(val) => setEditForm((p) => ({ ...p, condition: val }))}
                >
                  <SelectTrigger id="edit-condition" className="bg-background">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price" className="flex items-center gap-1.5 text-xs">
                <DollarSign className="h-3.5 w-3.5" /> Price (৳)
              </Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                value={editForm.price}
                onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                placeholder="e.g. 35000"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="flex items-center gap-1.5 text-xs">
                <AlignLeft className="h-3.5 w-3.5" /> Description
              </Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Product description"
                rows={3}
                className="bg-background resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditTarget(null)}
              >
                Cancel
              </Button>
              <StatefulButton
                type="submit"
                size="sm"
                state={editState}
                loadingText="Saving"
                successText="Saved!"
                errorText="Retry"
              >
                Save Changes
              </StatefulButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
