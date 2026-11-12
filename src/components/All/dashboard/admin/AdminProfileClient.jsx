"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { updateMyProfile, uploadImage } from "@/lib/action/action";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StatefulButton } from "@/components/motion/button/stateful";
import { FileUpload } from "@/components/motion/file-upload";
import { User, Phone, MapPin, Save, ShieldCheck, Lock } from "lucide-react";
import Image from "next/image";
import { LocationSelect } from "@/components/All/shared/LocationSelect";
import { normalizeContact, toLocationObject } from "@/lib/user-fields";

function isPhoneLocked(contact) {
  const digits = String(contact || "").replace(/^\+?880/, "").replace(/\D/g, "");
  return digits.length >= 10;
}

export function AdminProfileClient({ initialProfile }) {
  const { data: session } = authClient.useSession();
  const [profile, setProfile] = useState(initialProfile);
  const [saveState, setSaveState] = useState("idle");
  const [uploadItems, setUploadItems] = useState([]);

  const [form, setForm] = useState(() => {
    if (!initialProfile) return { name: "", contact: "", location: toLocationObject(null), image: "" };
    return {
      name: initialProfile.name || "",
      contact: initialProfile.contact ? String(initialProfile.contact) : "",
      location: toLocationObject(initialProfile.location),
      image: initialProfile.image || "",
    };
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saveState === "loading") return;
    setSaveState("loading");
    const payload = { ...form, contact: normalizeContact(form.contact) };
    const res = await updateMyProfile(payload);
    if (res.success) {
      await authClient.updateUser({ name: form.name, image: form.image || null });
      setSaveState("success");
      toast.success("Profile updated");
      setForm(payload);
      setProfile((prev) => ({ ...prev, ...payload }));
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

  const initial = (profile?.name || "A").slice(0, 2).toUpperCase();
  const phoneLocked = isPhoneLocked(form.contact);

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
          <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary capitalize">
            {session?.user?.role || profile?.role || "admin"}
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
          <Label className="flex items-center gap-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5" /> Location
          </Label>
          <LocationSelect
            value={form.location}
            onChange={(location) => setForm((prev) => ({ ...prev, location }))}
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
          Email and role cannot be changed here. Admins are managed at the server level.
        </p>
      </div>
    </motion.div>
  );
}
