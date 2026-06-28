"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { getMyProfile, updateMyProfile, uploadImage } from "@/lib/action/action";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StatefulButton } from "@/components/motion/button/stateful";
import { FileUpload } from "@/components/motion/file-upload";
import { User, Phone, MapPin, Save, ShieldCheck, Lock } from "lucide-react";

function isPhoneLocked(contact) {
  const digits = String(contact || "").replace(/^\+?880/, "").replace(/\D/g, "");
  return digits.length >= 10;
}
import Image from "next/image";

export default function SellerProfilePage() {
  const { data: session } = authClient.useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle");
  const [uploadItems, setUploadItems] = useState([]);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    location: "",
    image: "",
  });

  useEffect(() => {
    const load = async () => {
      const res = await getMyProfile();
      if (res.success) {
        setProfile(res.result);
        const loc = res.result.location;
        const locationStr =
          loc && typeof loc === "object"
            ? [loc.area, loc.district, loc.division, loc.country].filter(Boolean).join(", ")
            : loc || "";
        setForm({
          name: res.result.name || "",
          contact: res.result.contact ? String(res.result.contact) : "",
          location: locationStr,
          image: res.result.image || "",
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saveState === "loading") return;
    setSaveState("loading");
    const res = await updateMyProfile(form);
    if (res.success) {
      await authClient.updateUser({ name: form.name, image: form.image || null });
      setSaveState("success");
      toast.success("Profile updated");
      setProfile((prev) => ({ ...prev, ...form }));
    } else {
      setSaveState("error");
      toast.error(res.message || "Failed to update profile");
    }
    setTimeout(() => setSaveState("idle"), 2500);
  };

  const handleFilesAdded = useCallback(async (addedItems, files) => {
    const file = files[0];
    const item = addedItems[0];
    if (!file || !item) return;

    const res = await uploadImage(file, "Kino.com/profiles");

    if (res.success && res.result?.url) {
      setForm((prev) => ({ ...prev, image: res.result.url }));
      setUploadItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, status: "success", progress: 100 } : i)
      );
      toast.success("Photo uploaded — save your profile to apply it");
      setTimeout(() => setUploadItems([]), 1500);
    } else {
      setUploadItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, status: "error", error: res.message || "Upload failed" } : i)
      );
      toast.error(res.message || "Upload failed");
    }
  }, []);

  const handleRetry = useCallback(async (item) => {
    if (!item.file) return;
    setUploadItems((prev) =>
      prev.map((i) => i.id === item.id ? { ...i, status: "uploading", progress: 0, error: undefined } : i)
    );
    const res = await uploadImage(item.file, "Kino.com/profiles");
    if (res.success && res.result?.url) {
      setForm((prev) => ({ ...prev, image: res.result.url }));
      setUploadItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, status: "success", progress: 100 } : i)
      );
      setTimeout(() => setUploadItems([]), 1500);
    } else {
      setUploadItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, status: "error", error: res.message || "Upload failed" } : i)
      );
    }
  }, []);

  const initial = (profile?.name || "U").slice(0, 2).toUpperCase();
  const role = session?.user?.role || profile?.role || "seller";
  const phoneLocked = isPhoneLocked(form.contact);

  if (loading) {
    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Avatar card */}
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
        <div className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border-2 border-border">
          {form.image ? (
            <Image src={form.image} alt={form.name || "profile"} fill unoptimized className="object-cover" />
          ) : (
            <span className="text-xl font-black text-primary">{initial}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-foreground truncate">{profile?.name || "—"}</p>
          <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 capitalize">
            {role}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <p className="text-sm font-semibold text-foreground">Edit Information</p>
        <Separator />

        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-1.5 text-xs">
            <User className="h-3.5 w-3.5" /> Full Name
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={handleChange("name")}
            placeholder="Your full name"
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact" className="flex items-center gap-1.5 text-xs">
            <Phone className="h-3.5 w-3.5" /> Phone / Contact
            {phoneLocked && (
              <span className="ml-auto flex items-center gap-1 text-muted-foreground font-normal">
                <Lock className="h-3 w-3" /> Locked
              </span>
            )}
          </Label>
          <Input
            id="contact"
            value={form.contact}
            onChange={handleChange("contact")}
            placeholder="+880 17XX XXXXXX"
            readOnly={phoneLocked}
            className={phoneLocked ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-background"}
          />
          {phoneLocked && (
            <p className="text-xs text-muted-foreground">
              Phone number is verified and locked. Contact an admin to change it.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5" /> Location
          </Label>
          <Input
            id="location"
            value={form.location}
            onChange={handleChange("location")}
            placeholder="Dhaka, Bangladesh"
            className="bg-background"
          />
        </div>

        {/* Photo upload */}
        <div className="space-y-3">
          <Label htmlFor="image" className="flex items-center gap-1.5 text-xs">Profile Photo</Label>
          <div className="flex gap-2">
            <Input
              id="image"
              value={form.image}
              onChange={handleChange("image")}
              placeholder="https://… paste image URL or upload below"
              className="bg-background font-mono text-xs"
            />
            {form.image && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                className="shrink-0 text-destructive hover:underline text-xs whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
          <FileUpload
            multiple={false}
            accept="image/*"
            title="Upload a photo"
            description="JPG, PNG, WebP — max 5 MB"
            browseLabel="Choose"
            value={uploadItems}
            onValueChange={setUploadItems}
            onFilesAdded={handleFilesAdded}
            onRetry={handleRetry}
            onRemove={(item) =>
              setUploadItems((prev) => prev.filter((i) => i.id !== item.id))
            }
          />
        </div>

        <div className="pt-1">
          <StatefulButton
            type="submit"
            state={saveState}
            icon={<Save className="h-4 w-4" />}
            loadingText="Saving"
            successText="Saved!"
            errorText="Retry"
          >
            Save Changes
          </StatefulButton>
        </div>
      </form>

      {/* Read-only account info */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Account Information
        </p>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground mt-0.5 truncate">{profile?.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="text-sm font-medium text-foreground mt-0.5 capitalize">{profile?.role || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Account Status</p>
            <p className={`text-sm font-medium mt-0.5 capitalize ${
              profile?.status === "blocked"
                ? "text-destructive"
                : "text-green-600 dark:text-green-400"
            }`}>
              {profile?.status || "active"}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          Email and role cannot be changed here. Contact support if needed.
        </p>
      </div>
    </motion.div>
  );
}
