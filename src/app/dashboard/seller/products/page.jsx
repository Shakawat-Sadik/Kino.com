"use client";
"use no memo";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getMyProducts, deleteProduct, updateProduct } from "@/lib/action/action";
import { StatusBadge } from "@/components/All/dashboard/shared/StatusBadge";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Plus, Pencil, Trash2, Search, X } from "lucide-react";

const CATEGORIES = ["Electronics", "Fashion", "Furniture", "Vehicles", "Mobile Phones", "Other"];
const CONDITIONS = ["Used", "Like New", "Refurbished"];
const STATUSES = ["All", "available", "sold", "removed"];

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const query = {};
    if (search) query.search = search;
    if (statusFilter !== "All") query.status = statusFilter;
    const res = await getMyProducts(query);
    setProducts(res.success ? (res.result ?? []).filter(Boolean) : []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId) => {
    setDeleting(productId);
    const res = await deleteProduct(productId);
    if (res.success) {
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p?._id && p._id !== productId));
    } else {
      toast.error(res.message || "Failed to delete product");
    }
    setDeleting(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    const form = e.target;
    const updateData = {
      title: form.title.value,
      description: form.description.value,
      category: form.category.value,
      condition: form.condition.value,
      price: Number(form.price.value),
    };
    const res = await updateProduct(editProduct._id, updateData);
    if (res.success) {
      toast.success("Product updated");
      setProducts((prev) =>
        prev.filter(Boolean).map((p) =>
          p._id === editProduct._id ? { ...p, ...updateData } : p
        )
      );
      setEditProduct(null);
    } else {
      toast.error(res.message || "Failed to update product");
    }
    setEditSaving(false);
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex justify-end">
        <Link
          href="/dashboard/seller/products/add"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product name..."
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-card">
            <SelectValue placeholder="Filter by status" />
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
        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 w-full rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No products found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || statusFilter !== "All"
                ? "Try changing your filters"
                : "Add your first product to start selling"}
            </p>
            {!search && statusFilter === "All" && (
              <Link
                href="/dashboard/seller/products/add"
                className="inline-block mt-4 text-xs font-semibold text-primary hover:underline"
              >
                Add a product →
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground pl-5 w-14">Image</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Title</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Category</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Condition</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Price</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {products.filter(Boolean).map((product, i) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="border-border"
                  >
                    <TableCell className="pl-5 py-3">
                      <div className="relative h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                        {product.title}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{product.category}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{product.condition}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold">
                        ৳{product.price?.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex items-center gap-2">
                        {/* Edit */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2.5"
                          onClick={() => setEditProduct(product)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        {/* Delete */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-2.5 text-red-500 border-red-500/30 hover:bg-red-500/10"
                              disabled={deleting === product._id}
                            >
                              {deleting === product._id ? (
                                <span className="text-xs">...</span>
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                              <AlertDialogDescription>
                                <strong>{product.title}</strong> will be permanently removed. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product._id)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-black">Edit Product</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <form onSubmit={handleEditSave} className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-xs">Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={editProduct.title}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-desc" className="text-xs">Description</Label>
                <Textarea
                  id="edit-desc"
                  name="description"
                  defaultValue={editProduct.description}
                  rows={3}
                  className="bg-background resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Category</Label>
                  <Select name="category" defaultValue={editProduct.category}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Condition</Label>
                  <Select name="condition" defaultValue={editProduct.condition}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
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
                <Label htmlFor="edit-price" className="text-xs">Price (৳)</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  min="1"
                  defaultValue={editProduct.price}
                  required
                  className="bg-background"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditProduct(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={editSaving}>
                  {editSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
