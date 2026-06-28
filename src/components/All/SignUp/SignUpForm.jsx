"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { sonnerFunctionality } from "@/lib/sonnerFunctionality";
import { eliteDateFormat } from "@/lib/utils";
import { UserPlus, Eye, EyeClosed } from "lucide-react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StatefulButton } from "@/components/motion/button/stateful";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/motion/file-upload";

// Import the location data
import bdLocations from "@/lib/bd-locations.json";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PROFILES_PRESET;

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "Kino.com/profiles");
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message || "Upload failed");
  return data.secure_url;
}

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [buttonState, setButtonState] = useState("idle");
  const [showPass, setShowPass] = useState(false);
  const [userName, setUserName] = useState(null);

  // Photo upload state
  const [photoItems, setPhotoItems] = useState([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  // Location States
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  
  // Contact State
  const [phoneNumber, setPhoneNumber] = useState("");

  // --- Dropdown Logic ---
  const availableDistricts = useMemo(() => {
    if (selectedDivision) {
      const div = bdLocations.find((d) => d.division === selectedDivision);
      return div ? div.districts : [];
    }
    return bdLocations.flatMap((d) => d.districts);
  }, [selectedDivision]);

  const availableAreas = useMemo(() => {
    // If a district is selected, show ONLY its areas (clean string values)
    if (selectedDistrict) {
      const dist = availableDistricts.find((d) => d.district === selectedDistrict);
      return dist ? dist.areas.map((a) => ({ value: a, label: a })) : [];
    }
    
    // If NO district is selected, show ALL areas, but append district name to value to prevent Radix UI duplicate key glitch
    const allAreas = [];
    availableDistricts.forEach((dist) => {
      dist.areas.forEach((area) => {
        allAreas.push({
          value: `${area}__${dist.district}`, // Hidden unique key
          label: area,                         // What user sees
        });
      });
    });
    return allAreas;
  }, [selectedDistrict, availableDistricts]);

  // --- Auto-Select Handlers ---
  const handleDivisionChange = (value) => {
    setSelectedDivision(value);
    setSelectedDistrict(""); // Reset children
    setSelectedArea("");
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    setSelectedArea(""); // Reset area when district changes manually

    // AUTO-SELECT DIVISION
    if (!selectedDivision) {
      for (const div of bdLocations) {
        if (div.districts.some((d) => d.district === value)) {
          setSelectedDivision(div.division);
          break;
        }
      }
    }
  };

  const handleAreaChange = (value) => {
    let finalArea = value;
    let targetDistrict = selectedDistrict;

    // If value contains "__", it means it came from the "All Areas" unfiltered list
    if (value.includes("__")) {
      const [areaName, distName] = value.split("__");
      finalArea = areaName;
      targetDistrict = distName;
    }

    setSelectedArea(finalArea);

    // AUTO-SELECT DISTRICT & DIVISION
    if (targetDistrict && targetDistrict !== selectedDistrict) {
      setSelectedDistrict(targetDistrict);
    }

    if (!selectedDivision || (targetDistrict && targetDistrict !== selectedDistrict)) {
      for (const div of bdLocations) {
        if (div.districts.some((d) => d.district === targetDistrict)) {
          setSelectedDivision(div.division);
          break;
        }
      }
    }
  };

  const handlePhotoAdded = async (addedItems, rawFiles) => {
    const item = addedItems[0];
    const file = rawFiles[0];
    try {
      const url = await uploadToCloudinary(file);
      setUploadedImageUrl(url);
      setPhotoItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, status: "success", progress: 100 } : i)
      );
    } catch {
      setPhotoItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, status: "error", error: "Upload failed" } : i)
      );
    }
  };

  const handlePhotoRetry = async (item) => {
    if (!item.file) return;
    try {
      const url = await uploadToCloudinary(item.file);
      setUploadedImageUrl(url);
      setPhotoItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, status: "success", progress: 100, error: undefined } : i)
      );
    } catch {
      setPhotoItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, status: "error", error: "Upload failed" } : i)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonState("loading");
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;
    const name = e.target.name.value;
    const image = uploadedImageUrl || e.target.image.value || "";
    const role = e.target.role.value;

    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      toast.error("Invalid Password", { description: "Min 6 chars, 1 uppercase, 1 lowercase." });
      setButtonState("error");
      setTimeout(() => setButtonState("idle"), 2000);
      setLoading(false);
      return;
    }

    const location = {
      country: "Bangladesh",
      division: selectedDivision,
      district: selectedDistrict,
      area: selectedArea,
    };

    // Format Contact
    let finalContact = "+880";
    if (phoneNumber) {
      let num = phoneNumber.replace(/\D/g, ""); 
      if (num.startsWith("0") && num.length === 11) num = num.substring(1);
      finalContact = `+880${num}`;
    }

    const { data, error } = await authClient.signUp.email({
      email, password, name, role, image, location, contact: finalContact,
    });
    
    setUserName(data?.name);

    if (error) {
      toast.error("Registration Failed", { description: error.message || eliteDateFormat() });
      setButtonState("error");
      setTimeout(() => setButtonState("idle"), 2000);
      setLoading(false);
    } else {
      toast.success("Account Created!", sonnerFunctionality(UserPlus));
      setButtonState("success");
      setTimeout(() => setButtonState("idle"), 2000);
      router.push("/auth/login");
    }
  };

  const handleGoogle = async () => {
    setSocialLoading(true);
    await authClient.signIn.social({ provider: "google", callbackURL: redirect });
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 md:py-14 lg:py-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-foreground">Create Account</h1>
        <p className="text-muted-foreground mt-2">Join <span className="text-chart-3">Kino.com</span> today</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <Button variant="outline" className="w-full gap-2" onClick={handleGoogle} disabled={socialLoading}>
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12 11v2.4h3.3c-.13.75-.92 2.2-3.3 2.2c-1.99 0-3.6-1.64-3.6-3.6s1.61-3.6 3.6-3.6c1.13 0 1.88.48 2.32.89l1.58-1.52C13.93 6.55 12.78 6 11.1 6C7.93 6 5.36 8.57 5.36 11.75s2.57 5.75 5.75 5.75c3.32 0 5.52-2.33 5.52-5.61c0-.38-.04-.67-.09-.96H12z"/></svg>
          Sign up with Google
        </Button>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">OR</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" required placeholder="Your full name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>

          <div className="space-y-2">
            <Label>Photo (Optional)</Label>
            <div className="flex flex-col gap-3 items-center">
              {/* URL input */}
              <div className="flex-1 space-y-1 w-full">
                <p className="text-xs text-muted-foreground">Paste a URL</p>
                <Input
                  id="image"
                  name="image"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  disabled={!!uploadedImageUrl}
                  className={uploadedImageUrl ? "opacity-40" : ""}
                />
              </div>

              {/* OR divider */}
              <div className="flex items-center justify-around gap-1 mt-5 shrink-0">
                <span className="text-[10px] text-muted-foreground leading-none">or</span>
              </div>

              {/* File upload */}
              <div className="flex-1 space-y-1 w-full">
                <p className="text-xs text-muted-foreground">Upload a file</p>
                <FileUpload
                  value={photoItems}
                  onValueChange={setPhotoItems}
                  onFilesAdded={handlePhotoAdded}
                  onRemove={() => setUploadedImageUrl("")}
                  onRetry={handlePhotoRetry}
                  accept="image/*"
                  multiple={false}
                  maxFiles={1}
                  title="Drop photo here"
                  description="PNG, JPG, WEBP"
                  browseLabel="Browse"
                />
              </div>
            </div>
          </div>

          <div className="relative space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type={showPass ? "text" : "password"} required placeholder={!showPass ? "******" : "password"} />
            <div onClick={() => setShowPass(!showPass)} className="absolute top-7 right-2 cursor-pointer">
              {showPass ? <Eye size={16} /> : <EyeClosed size={16} />}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <RadioGroup name="role" defaultValue="buyer" className="w-full p-2 rounded-md bg-popover border border-border">
              <Field orientation="horizontal">
                <RadioGroupItem value="buyer" id="buyer" />
                <FieldContent>
                  <FieldLabel htmlFor="buyer">Buyer.</FieldLabel>
                  <FieldDescription>Buy pre-owned items from sellers.</FieldDescription>
                </FieldContent>
              </Field>
              <Field orientation="horizontal">
                <RadioGroupItem value="seller" id="seller" />
                <FieldContent>
                  <FieldLabel htmlFor="seller">Seller</FieldLabel>
                  <FieldDescription>Find buyers for your unused items.</FieldDescription>
                </FieldContent>
              </Field>
            </RadioGroup>
          </div>

          {/* --- LOCATION SECTION --- */}
          <div className="space-y-2">
            <Label>Location</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={selectedDivision} onValueChange={handleDivisionChange}>
                <SelectTrigger><SelectValue placeholder="Division" /></SelectTrigger>
                <SelectContent>
                  {bdLocations.map((div) => (
                    <SelectItem key={div.division} value={div.division}>{div.division}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
                <SelectContent>
                  {availableDistricts.map((dist) => (
                    <SelectItem key={dist.district} value={dist.district}>{dist.district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedArea} onValueChange={handleAreaChange}>
                <SelectTrigger><SelectValue placeholder="Area" /></SelectTrigger>
                <SelectContent>
                  {availableAreas.map((area) => (
                    <SelectItem key={area.value} value={area.value}>{area.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* --- CONTACT SECTION --- */}
          <div className="space-y-2">
            <Label>Contact</Label>
            <div className="flex gap-2">
              <Input defaultValue="+880" disabled className="w-24 bg-muted text-muted-foreground cursor-not-allowed" />
              <Input
                type="tel"
                placeholder="1XXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <StatefulButton
            type="submit"
            state={loading ? "loading" : "idle"}
            loadingText="Creating account..."
            successText={userName ? `Welcome, ${userName.split(" ")[0]}!` : "Account Created!"}
            errorText="Something went wrong"
            icon={<UserPlus size={16} />}
            className="w-full rounded-xl"
            disabled={loading}
          >
            Register
          </StatefulButton>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary font-semibold hover:underline">Login</Link>
      </p>
    </div>
  );
}