"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { createProduct } from "@/lib/action/action";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus, X, ArrowLeft, Package } from "lucide-react";


const CATEGORIES = ["Electronics", "Fashion", "Furniture", "Vehicles", "Mobile Phones", "Other"];
const CONDITIONS = ["Used", "Like New", "Refurbished"];

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    price: "",
    quantity: "1",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }
    const newFiles = [...imageFiles, ...files];
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    setUploading(true);

    const credRes = await fetch("/api/cloudinary/sign", { method: "POST" });
    const { cloudName, clientApiKey, timestamp, signature, folder } = await credRes.json();

    let completed = 0;

    const urls = await Promise.all(
      imageFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", clientApiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Upload failed");

        completed++;
        setUploadProgress(Math.round((completed / imageFiles.length) * 100));
        return data.secure_url;
      }),
    );

    setUploading(false);
    setUploadProgress(0);
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category) {
      toast.error("Please select a category");
      return;
    }
    if (!form.condition) {
      toast.error("Please select a condition");
      return;
    }
    if (imageFiles.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setSubmitting(true);

    try {
      const imageUrls = await uploadImages();

      const productData = {
        title: form.title,
        description: form.description,
        category: form.category,
        condition: form.condition,
        price: Number(form.price),
        quantity: Number(form.quantity),
        images: imageUrls,
      };

      const res = await createProduct(productData);

      if (res.success) {
        toast.success("Product listed successfully!");
        router.push("/dashboard/seller/products");
      } else {
        toast.error(res.message || "Failed to create product");
      }
    } catch (err) {
      toast.error("Image upload failed. Try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = uploading || submitting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl text-muted-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-foreground">Add Product</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            List a new item for sale
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <p className="text-sm font-semibold text-foreground">Product Details</p>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs">
              Product Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={handleChange("title")}
              placeholder="e.g. Used Dell Inspiron 15 Laptop"
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Describe the item's condition, features, any defects..."
              required
              rows={4}
              className="bg-background resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={handleSelectChange("category")} value={form.category}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">
                Condition <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={handleSelectChange("condition")} value={form.condition}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-xs">
                Price (৳) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={form.price}
                onChange={handleChange("price")}
                placeholder="35000"
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-xs">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange("quantity")}
                className="bg-background"
              />
            </div>
          </div>
        </div>

        {/* Image upload */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Product Images <span className="text-red-500">*</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload up to 4 images. First image is the cover.
            </p>
          </div>

          {/* Previews grid */}
          <div className="grid grid-cols-4 gap-3">
            {imagePreviews.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border"
              >
                <img
                  src={src}
                  alt={`preview-${i}`}
                  className="w-full h-full object-cover"
                />
                {i === 0 && (
                  <span className="absolute top-1 left-1 text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {imagePreviews.length < 4 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px] font-medium">Add</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading images...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            {uploading
              ? `Uploading... ${uploadProgress}%`
              : submitting
              ? "Listing product..."
              : "List Product"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
