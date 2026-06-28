Here is the exact, step-by-step roadmap to integrate the Hybrid Upload system into your existing Express/Next.js architecture. 

Since we are keeping MongoDB access strictly on the Express backend, we need to install dependencies there, create the routes, and then create a simple proxy in your Next.js `action.js`.

---

### Step 1: Install Backend Dependencies
In your **Express backend folder** (where your `package.json` is), run:
```bash
npm install multer cloudinary
```
*   `multer`: Express middleware to parse `multipart/form-data` (files).
*   `cloudinary`: The Node SDK to securely upload using your Master Admin key.

---

### Step 2: Configure Cloudinary in Express
Create a new file in your Express project: `lib/cloudinary.js` (or add it to the top of your server file).

```javascript
// lib/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
```

---

### Step 3: Create the Hash Utility for Node.js
Create `lib/hash.js` in your Express project. *(Note: We use Node's native `crypto` module here, not the browser's `crypto.subtle`)*.

```javascript
// lib/hash.js
import crypto from "crypto";

export function calculateHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
```

---

### Step 4: Add the Upload & Delete Routes to Express
Add this code to your main Express file (e.g., `index.js` or `server.js`). **Place it near the top with your other imports and middleware.**

```javascript
import multer from "multer";
import cloudinary from "./lib/cloudinary.js";
import { calculateHash } from "./lib/hash.js";

// Configure Multer to store files in memory (so we can hash the buffer)
const upload = multer({ storage: multer.memoryStorage() });

// ─────────────────────────────────────────────────────────────
// UPLOAD ROUTE (Requires Auth)
// ─────────────────────────────────────────────────────────────
app.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    const folder = req.body.folder || "Kino.com";
    const uploadsCol = req.db.collection("cloudinary_uploads");

    // 1. Calculate Hash from the memory buffer
    const hash = calculateHash(req.file.buffer);

    // 2. Check for duplicate
    const existingFile = await uploadsCol.findOne({ hash });
    if (existingFile) {
      return res.status(200).json({
        success: true,
        result: {
          url: existingFile.url,
          public_id: existingFile.public_id,
          isDuplicate: true,
        },
      });
    }

    // 3. Convert buffer to Base64 Data URI for Cloudinary
    const base64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    // 4. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "image",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    // 5. Save to MongoDB
    await uploadsCol.insertOne({
      hash,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      public_id: result.public_id,
      url: result.secure_url,
      folder: result.folder,
      uploadedBy: req.user.email,
      createdAt: new Date(),
    });

    // 6. Return success
    return res.status(200).json({
      success: true,
      result: {
        url: result.secure_url,
        public_id: result.public_id,
        isDuplicate: false,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE ROUTE (For updating profiles/deleting products)
// ─────────────────────────────────────────────────────────────
app.delete("/upload/:publicId", verifyToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // 1. Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // 2. Remove from MongoDB tracking
    await req.db.collection("cloudinary_uploads").deleteOne({ public_id: publicId });

    return res.status(200).json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
});
```

---

### Step 5: Add the Server Action to Next.js (`action.js`)
Now, go back to your **Next.js** project. Add this function to your `src/lib/action/action.js` file. 

**Important:** We do *not* use your `fetchAPI` wrapper here because `fetchAPI` hardcodes `"Content-Type": "application/json"`, which breaks file uploads. We let the browser handle the headers.

```javascript
// ─────────────────────────────────────────────────────────────
// CLOUDINARY — IMAGE UPLOAD & DELETE
// Express routes:
//   POST   /upload             → upload image
//   DELETE /upload/:publicId   → delete image
// ─────────────────────────────────────────────────────────────

export async function uploadImage(file, folder = "Kino.com/Products") {
  try {
    const token = await getAuthHeaders();
    if (!token) {
      return { success: false, message: "Not authenticated", result: null };
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        // DO NOT set Content-Type! Browser sets it with boundary automatically.
      },
      body: formData,
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || "Upload failed",
        result: null,
      };
    }

    return data;
  } catch (error) {
    console.error("[uploadImage] Error:", error.message);
    return {
      success: false,
      message: "Network error during upload.",
      result: null,
    };
  }
}

export async function deleteImage(publicId) {
  try {
    const token = await getAuthHeaders();
    if (!token) return { success: false, message: "Not authenticated" };

    const res = await fetch(`${API_URL}/upload/${publicId}`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data.message || "Delete failed" };
    }
    return data;
  } catch (error) {
    return { success: false, message: "Network error during delete." };
  }
}
```

---

### Step 6: How to Use in Your Client Components

Now, in your Add Product form or Profile form, you just import and use it like any other server action:

**For Adding a Product:**
```jsx
import { uploadImage, createProduct } from "@/lib/action/action";

const handleImage = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 1. Upload to Express -> Cloudinary -> Mongo
  const uploadRes = await uploadImage(file, "Kino.com/Products");
  
  if (uploadRes.success) {
    if (uploadRes.result.isDuplicate) {
      toast.warning("Duplicate detected, using existing image");
    }
    
    // 2. Save the URL to your product form state
    setProductData(prev => ({ ...prev, image: uploadRes.result.url }));
  }
};
```

**For Updating a Profile (with deletion of old image):**
```jsx
import { uploadImage, deleteImage, updateMyProfile } from "@/lib/action/action";

const handleAvatarUpdate = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const uploadRes = await uploadImage(file, "Kino.com/Profiles");
  
  if (uploadRes.success) {
    // If user had an old profile pic, delete it from Cloudinary
    if (oldPublicId) {
      await deleteImage(oldPublicId);
    }

    // Update user profile in DB
    await updateMyProfile({ image: uploadRes.result.url });
  }
};
```

---

### Step 7: Final MongoDB Setup (One-time)
Because we moved the logic to Express, make sure you create the unique index on your MongoDB database so duplicate lookups are instant. Run this in MongoDB Compass or your mongo shell:

```javascript
db.collection("cloudinary_uploads").createIndex({ hash: 1 }, { unique: true })
```

### Summary of what you just built:
1. **Client** picks a file.
2. **Next.js Server Action** attaches JWT token and forwards the file.
3. **Express** receives file in memory, calculates SHA-256 hash.
4. **Express** checks MongoDB for hash. If found -> returns URL immediately (saves Cloudinary bandwidth).
5. If new, **Express** uploads to Cloudinary, saves hash/URL to MongoDB, returns URL.
6. **Client** receives URL and saves it to the Product/User document via your existing `createProduct` actions.