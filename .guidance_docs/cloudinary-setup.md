# Cloudinary Setup — A to Z
**Project: Kino.com (ReSell Hub)**
Stack: Next.js 16 · Express 5 (ESM) · MongoDB · Server Actions

---

## Architecture Overview

```
Client Component
  → calls uploadImage(file, folder)  [action.js — "use server"]
  → Server Action sends raw binary to Express  POST /upload
  → Express hashes buffer (SHA-256), checks MongoDB for duplicate
  → If new: uploads to Cloudinary, saves record to cloudinary_uploads collection
  → Returns { url, public_id, isDuplicate }
  → Client stores url in product/user document
```

Cloudinary credentials live only in the **Express `.env`** — never in the Next.js environment. The old Next.js API route (`/api/cloudinary/sign`) has been replaced with a 410 stub.

---

## Step 1 — Cloudinary Account & Credentials

1. Go to https://cloudinary.com, sign up, and open the Dashboard.
2. Three values you need:
   - **Cloud Name** — shown at the top of the dashboard
   - **API Key**
   - **API Secret**

---

## Step 2 — Packages Already Installed

| Package | Where | Status |
|---|---|---|
| `cloudinary` | `Kino_ServerSide/` | ✅ installed |
| `cloudinary` | `kino.com/` (Next.js) | ✅ installed (unused — keep for potential future use) |

No additional installs needed.

---

## Step 3 — Environment Variables

**Server** — `Kino_ServerSide/.env` (already added):
```env
CLOUDINARY_CLOUD_NAME=sadik-store
CLOUDINARY_API_KEY=626882414397474
CLOUDINARY_API_SECRET=5P4N9Y1zaLp7s_blM_IrLK_UTtw
```

**Client** — `kino.com/.env` — the duplicate key pairs are no longer needed. Clean it down to:
```env
# remove these (all replaced by Express-side vars):
# CLOUDINARY_CLIENT_API_KEY
# CLOUDINARY_CLIENT_API_SECRET
# CLOUDINARY_CLIENT_URL
# CLOUDINARY_ADMIN_API_KEY
# CLOUDINARY_ADMIN_API_SECRET
# CLOUDINARY_ADMIN_URL
# CLOUDINARY_CLOUD_NAME  (on client)
```

Also revoke the second (admin) API key in Cloudinary dashboard → **Settings → Access Keys**.

---

## Step 4 — What Was Added to `index.js`

Cloudinary is configured at the top of `index.js` after `dotenv.config()`:

```js
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
```

Two routes were added before the server initialization block:

### `POST /upload`

- Auth: `verifyToken` (any logged-in role)
- Receives raw binary body (`Content-Type: image/jpeg` etc.)
- Custom headers carry metadata:
  - `x-upload-folder` — Cloudinary folder (e.g. `Kino.com/products`)
  - `x-upload-filename` — original file name (for record keeping)
- SHA-256 hashes the buffer → checks `cloudinary_uploads` collection → short-circuits if duplicate found
- Uploads as base64 data URI with auto quality/format transformations
- Saves upload record to MongoDB and returns `{ url, public_id, isDuplicate }`

### `DELETE /upload/*publicId`

- Auth: `verifyToken` + ownership check (`uploadedBy === req.user.email`)
- `*publicId` is an Express 5 wildcard — captures the full Cloudinary public_id including slashes (e.g. `Kino.com/products/abc123`)
- Destroys the image on Cloudinary and removes the record from MongoDB

---

## Step 5 — What Was Added to `action.js`

Two server actions at the bottom of `src/lib/action/action.js`:

### `uploadImage(file, folder)`

```js
uploadImage(file, "Kino.com/products")  // for product images
uploadImage(file, "Kino.com/profiles")  // for profile photos
```

- Sends the `File` object as a raw binary body to Express `POST /upload`
- Does NOT use the `fetchAPI` wrapper — that wrapper forces `Content-Type: application/json` which breaks binary uploads
- Attaches JWT from `getAuthHeaders()` manually
- Returns `{ success, result: { url, public_id, isDuplicate } }`

### `deleteImage(publicId)`

```js
deleteImage("Kino.com/products/abc123")
```

- Sends `DELETE /upload/Kino.com/products/abc123` to Express
- Express wildcard route captures the full public_id including slashes — no URL encoding needed

---

## Step 6 — MongoDB Index (one-time setup)

Create a unique index on the `hash` field so duplicate lookups are instant and the race condition guard works correctly. Run once in MongoDB Compass or `mongosh`:

```js
use kino_main
db.cloudinary_uploads.createIndex({ hash: 1 }, { unique: true })
```

---

## Step 7 — Next.js Config Changes (`next.config.mjs`)

Two changes were made:

**1. Server actions body size limit** — Next.js defaults to 1MB for server action arguments. Product images can exceed that. Raised to 5MB:

```js
experimental: {
  serverActions: {
    bodySizeLimit: "5mb",
  },
},
```

**2. Cloudinary image domain** — Added `res.cloudinary.com` to `remotePatterns` so `<Image>` from `next/image` works with Cloudinary URLs:

```js
{
  protocol: "https",
  hostname: "res.cloudinary.com",
  pathname: "**",
},
```

---

## Step 8 — How to Use in Components

### Add Product Form (seller)

```jsx
"use client";
import { useState } from "react";
import { uploadImage } from "@/lib/action/action";

export default function AddProductForm() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file, "Kino.com/products");
      if (res.success) setImageUrl(res.result.url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // use imageUrl in your createProduct() call:
  // await createProduct({ ...formData, images: [imageUrl] });
}
```

### Profile Photo Update (any role)

```jsx
"use client";
import { uploadImage, deleteImage, updateMyProfile } from "@/lib/action/action";

const handleAvatarChange = async (e, oldPublicId) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const res = await uploadImage(file, "Kino.com/profiles");
  if (!res.success) return;

  // Delete the old photo from Cloudinary if one exists
  if (oldPublicId) await deleteImage(oldPublicId);

  // Save new URL to user profile
  await updateMyProfile({ image: res.result.url });
};
```

> Store `public_id` alongside `image` url in the user document so you can pass it to `deleteImage` on next update.

---

## Step 9 — Vercel Deployment

Add these three vars to the **Express backend** Vercel project (not the Next.js one):

| Key | Value |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | `sadik-store` |
| `CLOUDINARY_API_KEY` | `626882414397474` |
| `CLOUDINARY_API_SECRET` | *(your secret)* |

The Next.js Vercel project needs **none** of these.

---

## File Map

| File | Change |
|---|---|
| `Kino_ServerSide/index.js` | Added cloudinary config, `POST /upload`, `DELETE /upload/*publicId` |
| `Kino_ServerSide/.env` | Added `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| `src/lib/action/action.js` | Added `uploadImage()`, `deleteImage()` |
| `next.config.mjs` | Added `serverActions.bodySizeLimit` and `res.cloudinary.com` remote pattern |
| `src/app/api/cloudinary/sign/route.js` | Replaced with 410 stub — route is superseded |
