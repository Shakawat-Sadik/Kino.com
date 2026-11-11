# Product Schema Uniformity + Seller Snapshot Propagation — Change Reference

> **Date:** 2026-11-11
> **Purpose:** Full record of the schema-uniformity work and the seller-snapshot
> propagation it required, kept as a reference for future bugs / edge-case changes.
> **Repos touched:**
> - **Frontend** — `Kino_ClientSide/kino.com` (Next.js)
> - **Backend** — `Kino_ServerSide_Render` (Express, the Onrender `REMOTE_MAIN_SERVER_URL`;
>   the **source of truth for the stored document shape**)

---

## 0. TL;DR

- Unified the product document shape for **new products only** (no migration of
  existing docs).
- Kept `sellerEmail` / `sellerName` at the top level as the **ownership key** the
  whole backend relies on, even though they are not in the "public" target shape.
- Restructured `sellerInfo` to `{ userId, contact: { mobile1, mobile2? } }`, added
  `quantity`, `location1` (+ optional `location2`), `updatedAt`; dropped the stale
  `dateUploaded` and the never-sent top-level `location`.
- Made all **read consumers backward-compatible** (old docs use the old seller
  shape; new docs use the new one — both must render).
- Added **eager (synchronous) snapshot propagation**: when a seller edits their
  profile, their product listings' copied seller fields are refreshed in the same
  request.

---

## 1. The original problem

Three different product-document shapes existed in the DB.

**(a) What the app wrote when a seller added a product (older build):**
```json
{
  "title": "HP Elitebook 855 G8",
  "condition": "Used",
  "price": 45000,
  "quantity": 1,
  "status": "sold",
  "dateUploaded": { "$date": "..." },
  "sellerEmail": "nathandrake@kinoseller.com",
  "sellerName": "Nathan Drake",
  "sellerInfo": { "createdAt": { "$date": "..." } }
}
```

**(b) Dummy docs added earlier:**
```json
{
  "title": "Honda Civic 2017 Black",
  "condition": "Excellent",
  "sellerInfo": {
    "userId": "user003", "name": "Shahdat Shakib", "email": "...",
    "photo": "...", "role": "seller", "phone": "...", "location": "...", "status": "active"
  },
  "status": "available"
}
```

**(c) Target shape requested (uniform):**
```jsonc
{
  "_id": { "$oid": "ObjectId" },
  "title": "string",
  "category": "Electronics" | "Mobile Phones" | "Mobile Accessories" | "PC & Laptops" | "PC & Laptops Gadgets" | "PC & Laptop Accessories" | "Furniture" | "Vehicles" | "Fashion, Beauty & Care" | "Home & Kitchen" | "Clothing & Garments" | "Books" | "Sports & Fitness" | "Gaming" | "Cameras" | "Education" | "Jobs & Services" | "Others",
  "condition": "string",
  "price": integer || 1,
  "quantity": integer || 1,                        // optional, default 1
  "location1": "string"           ,                // seller location, from `user` collection
  "location2"?: "string",                // optional, per-listing override
  "images": ["string"],                 // up to 10 cloudinary urls
  "description": "string",
  "sellerInfo": {
    "userId": "ObjectId (from user collection)",
    "contact": {
      "mobile1": "string",              // from user collection
      "mobile2": "string"               // optional, per-listing override
    }
  },
  "status": "available" || "pending" || "sold",
  "createdAt": { "$date": "..." },
  "updatedAt": { "$date": "..." }
}
```

---

## 2. Investigation findings (why the fix looks the way it does)

1. **The backend shapes the document, not the form.** The add-product form only
   sends `{ title, description, category, condition, price, quantity, images }`.
   Everything else (`sellerEmail`, `sellerInfo`, `status`, timestamps) is added by
   `seller.controller.js › createProduct`. The pasted HP-doc (`status:"sold"`,
   `sellerInfo:{createdAt}`) came from an **older** backend build.
2. **The live backend already differed** from the pasted HP shape: it wrote
   `sellerInfo:{email,name,phone}` + `status:"pending"`, **silently dropped
   `quantity`**, and read a `location` the form never sends.
3. **`sellerEmail` is the ownership key everywhere** — `seller` product
   list/update/delete, `orders`, `payments`, and checkout all filter by
   `sellerEmail: req.user.email`. Removing it = large cross-cutting refactor +
   order/payment migration. → We **keep it**.
4. **`getAuthUser` returns the FULL user doc** (`findOne({email},{projection:{password:0}})`,
   cached whole in Redis 15 min). So `req.dbUser` has `_id`, `name`, `contact`
   (phone), `location`. → `location1`, `mobile1`, `userId` are all derivable at
   create time.
5. **`user.location` is an object** `{area,district,division,country}` (or a
   string) → must be flattened to a string for `location1`.
6. **Orders copy the whole product** (`recordPurchase({ product })`) and resolve
   seller fields with fallbacks → keeping top-level `sellerEmail`/`sellerName`
   keeps orders working; only **seller phone** needed a new fallback.
7. **Read consumers of product seller fields:** `ProductDetail.jsx`,
   `AdminProductsClient.jsx` (list filter, table cell, edit dialog), plus
   `checkout` (`product.sellerName`) and `CheckoutForm` (`product.sellerEmail`) —
   the last two read the retained top-level fields, so they keep working untouched.

---

## 3. Decisions (asked & answered)

| # | Question | Decision |
|---|----------|----------|
| 1 | How far should the change reach? | **Backend write + form, new products only** (no data migration) |
| 2 | Target drops `sellerEmail`/`sellerName`; the backend keys everything off `sellerEmail`. | **Keep `sellerEmail`/`sellerName` internally** (lowest risk) |
| 3 | New products are `status:"pending"` (admin approval); target shows `"available"`. | **Keep `"pending"` moderation** (`"available"` was a sample value) |
| 4 | Target shows `condition:"Excellent"`; form offers Used/Like New/Refurbished. | **Keep the existing set** (`"Excellent"` was a sample) |

**Consequence of Decision 1 (no migration):** existing dummy (Honda-shape) and
older app-created docs keep their **old** seller shape. Therefore every reader of
product seller fields **must handle both shapes** — this is why the read side has
fallbacks (see §6.7, §6.8).

---

## 4. CHANGES — backend (`Kino_ServerSide_Render`)

### 4.1 `src/modules/seller/seller.controller.js › createProduct`

Writes the new uniform shape; keeps `sellerEmail`/`sellerName`; stores `userId` as
a **string** (see §5); reuses the shared `formatSellerLocation`.

```diff
@@ import { anchored } from "../../lib/search.js";
+import { formatSellerLocation } from "../../lib/sellerSnapshot.js";
 import * as service from "./seller.service.js";
@@ export async function createProduct(req, res) {
   try {
-    const { title, category, condition, price, description, images, location } = req.body;
+    const {
+      title, category, condition, price, description, images,
+      quantity, location2, mobile2,
+    } = req.body;
+
+    // location1 + mobile1 come from the seller's user record; the form only
+    // supplies the optional per-listing overrides (location2, mobile2).
+    const location1 = formatSellerLocation(req.dbUser?.location);
+
+    const contact = {
+      mobile1: req.dbUser?.contact ? String(req.dbUser.contact) : "",
+    };
+    if (mobile2) contact.mobile2 = String(mobile2);
+
+    const now = new Date();
     const product = {
-      title, category, condition, price: Number(price), description, images, location,
+      title,
+      category,
+      condition,
+      price: Number(price),
+      quantity: Number(quantity) || 1,
+      location1,
+      ...(location2 ? { location2: String(location2) } : {}),
+      images,
+      description,
+      // sellerEmail/sellerName are retained as the ownership key used across
+      // seller queries, orders, and payments — not part of the public shape.
       sellerEmail: req.user.email,
       sellerName: req.dbUser?.name || "",
       sellerInfo: {
-        email: req.user.email,
-        name: req.dbUser?.name || "",
-        phone: req.dbUser?.contact ? String(req.dbUser.contact) : "",
+        // Stored as a string (like buyerInfo.userId in orders) so it stays
+        // consistent whether dbUser came from the Redis cache (JSON string _id)
+        // or straight from Mongo (ObjectId) — otherwise a later $lookup against
+        // user._id would silently miss.
+        userId: req.dbUser?._id?.toString() || "",
+        contact,
       },
       status: "pending",
-      dateUploaded: new Date(),
-      createdAt: new Date(),
+      createdAt: now,
+      updatedAt: now,
     };
```

### 4.2 `src/modules/payments/payments.service.js › recordPurchase`

Orders snapshot the seller phone from the product; new products no longer have
`sellerInfo.phone`, so fall back to `sellerInfo.contact.mobile1`.

```diff
   const resolvedSellerName = product.sellerInfo?.name || product.sellerName || "";
-  const resolvedSellerPhone = product.sellerInfo?.phone || "";
+  const resolvedSellerPhone =
+    product.sellerInfo?.phone || product.sellerInfo?.contact?.mobile1 || "";
```

### 4.3 `src/lib/sellerSnapshot.js` — **NEW FILE**

Single home for the denormalized seller fields, shared by product-create and
profile-propagation so they always format the snapshot identically.

```js
/**
 * Seller fields that are DENORMALIZED into every product document — a snapshot of
 * the seller's `user` record taken at write time (location1, contact.mobile1,
 * sellerName). Centralised here so product creation and profile-update
 * propagation always build the snapshot the same way.
 */

/** Flatten a user `location` (object or string) into the product's `location1` string. */
export function formatSellerLocation(loc) {
  if (!loc) return "";
  if (typeof loc === "object") {
    return [loc.area, loc.district, loc.division, loc.country].filter(Boolean).join(", ");
  }
  return String(loc);
}

/**
 * Build the `$set` for products.updateMany when a seller edits their profile.
 * Only includes fields that actually changed (keys present in `changed`), and
 * uses dot-notation so per-listing overrides (location2, sellerInfo.contact.mobile2)
 * and sellerInfo.userId are left untouched. Returns {} when nothing relevant changed.
 *
 * @param {{ name?: string, location?: unknown, contact?: unknown }} changed
 */
export function sellerSnapshotUpdate(changed) {
  const set = {};
  if (changed.name !== undefined) set.sellerName = changed.name || "";
  if (changed.location !== undefined) set.location1 = formatSellerLocation(changed.location);
  if (changed.contact !== undefined) {
    set["sellerInfo.contact.mobile1"] = changed.contact ? String(changed.contact) : "";
  }
  return set;
}
```

### 4.4 `src/modules/profile/profile.service.js`

DB-layer propagation helper (keyed by the indexed `sellerEmail`).

```diff
 export async function updateProfile(db, email, update) {
   return db.collection("user").updateOne({ email }, { $set: update });
 }
+
+/**
+ * Propagate changed seller fields into that seller's product snapshots. Keyed by
+ * the indexed `sellerEmail`, so it touches only this seller's own listings.
+ */
+export async function updateSellerProductSnapshots(db, email, set) {
+  return db.collection("products").updateMany({ sellerEmail: email }, { $set: set });
+}
```

### 4.5 `src/modules/profile/profile.controller.js › update`

Eager, in-request, **best-effort** propagation after the profile save.

```diff
 import { sendError } from "../../lib/respond.js";
 import { invalidateAuthUser } from "../../lib/authCache.js";
-import { getProfile, updateProfile } from "./profile.service.js";
+import { del } from "../../lib/cache.js";
+import { PRODUCTS_DEFAULT_KEY } from "../../lib/cacheKeys.js";
+import { sellerSnapshotUpdate } from "../../lib/sellerSnapshot.js";
+import {
+  getProfile,
+  updateProfile,
+  updateSellerProductSnapshots,
+} from "./profile.service.js";
@@ export async function update(req, res) {
     const result = await updateProfile(req.db, req.user.email, updateDoc);
     await invalidateAuthUser(req.user.email);
+
+    // Eagerly propagate the changed fields into this seller's denormalized product
+    // snapshots (sellerName / location1 / contact.mobile1). Bounded to one seller's
+    // own listings and keyed by the indexed `sellerEmail`, so a synchronous
+    // updateMany stays cheap while keeping product reads side-effect-free and
+    // always fresh. Done in-request (not fire-and-forget) because the backup
+    // backend runs on Vercel serverless, where work started after the response may
+    // never execute. Best-effort: the profile save is the source of truth, so a
+    // failure to refresh the derived snapshots is logged, not surfaced as an error.
+    const snapshot = sellerSnapshotUpdate(updateDoc);
+    if (Object.keys(snapshot).length > 0) {
+      try {
+        await updateSellerProductSnapshots(req.db, req.user.email, snapshot);
+        await del(PRODUCTS_DEFAULT_KEY);
+      } catch (e) {
+        console.error(`[profile] snapshot propagation failed for ${req.user.email}:`, e.message);
+      }
+    }
+
     res.status(200).json({ success: true, message: "Profile updated", result });
```

---

## 5. CHANGES — frontend (`Kino_ClientSide/kino.com`)

### 5.1 `src/app/dashboard/seller/products/add/page.jsx`

Optional `location2` / `mobile2` inputs, 10-image cap (was 4), send the overrides.

```diff
@@ const [form, setForm] = useState({
     price: "",
     quantity: "1",
+    location2: "",
+    mobile2: "",
   });
@@ const handleImageSelect = (e) => {
     const files = Array.from(e.target.files);
-    if (imageFiles.length + files.length > 4) {
-      toast.error("Maximum 4 images allowed");
+    if (imageFiles.length + files.length > 10) {
+      toast.error("Maximum 10 images allowed");
       return;
     }
@@ (handleSubmit, after building productData)
         images: imageUrls,
       };
 
+      // Optional per-listing overrides; location1/mobile1 are filled server-side
+      // from the seller's profile.
+      const location2 = form.location2.trim();
+      const mobile2 = form.mobile2.trim();
+      if (location2) productData.location2 = location2;
+      if (mobile2) productData.mobile2 = mobile2;
+
       const res = await createProduct(productData);
@@ (new form fields, after the price/quantity grid)
           </div>
+
+          <div className="grid grid-cols-2 gap-4">
+            <div className="space-y-2">
+              <Label htmlFor="location2" className="text-xs">Listing Location</Label>
+              <Input id="location2" value={form.location2} onChange={handleChange("location2")}
+                placeholder="Defaults to your profile location" className="bg-background" />
+            </div>
+            <div className="space-y-2">
+              <Label htmlFor="mobile2" className="text-xs">Alternate Contact</Label>
+              <Input id="mobile2" type="tel" value={form.mobile2} onChange={handleChange("mobile2")}
+                placeholder="Optional, e.g. +8801XXXXXXXXX" className="bg-background" />
+            </div>
+          </div>
         </div>
@@ (image upload copy + add-button cap)
-              Upload up to 4 images. First image is the cover.
+              Upload up to 10 images. First image is the cover.
...
-            {imagePreviews.length < 4 && (
+            {imagePreviews.length < 10 && (
```

### 5.2 `src/components/All/Products/ProductDetail.jsx` — dual-shape seller panel

Resolves both the new (`contact.mobile1`, top-level `sellerName`/`sellerEmail`) and
legacy (`sellerInfo.{name,email,phone}`) shapes; adds `mobile2` + location rows.

```diff
@@ import {
   Phone,
   Mail,
+  MapPin,
   ChevronRight,
@@ Seller info
-          {
-            product.sellerInfo && (
+          {(() => {
+            // Seller fields were restructured: newer products store userId +
+            // contact.{mobile1,mobile2} and keep name/email at the top level,
+            // while older products used sellerInfo.{name,email,phone}. Resolve
+            // both shapes so the panel renders for either.
+            const seller = product.sellerInfo;
+            const sellerName = seller?.name || product.sellerName;
+            const sellerEmail = seller?.email || product.sellerEmail;
+            const mobile1 = seller?.phone || seller?.contact?.mobile1;
+            const mobile2 = seller?.contact?.mobile2;
+            const sellerLocation = product.location2 || product.location1;
+
+            if (!sellerName && !sellerEmail && !mobile1) return null;
+
+            return (
               <div className="rounded-xl border border-border bg-card p-4">
                 ...
-                  <p className="text-sm font-semibold text-foreground">
-                    {product.sellerInfo.name}
-                  </p>
-                  {product.sellerInfo.email && ( ... {product.sellerInfo.email} ... )}
-                  {product.sellerInfo.phone && ( ... {product.sellerInfo.phone} ... )}
+                  {sellerName && ( ... {sellerName} ... )}
+                  {sellerEmail && ( ...mailto:${sellerEmail}... {sellerEmail} ... )}
+                  {mobile1 && ( <Phone/> {mobile1} )}
+                  {mobile2 && ( <Phone/> {mobile2} )}
+                  {sellerLocation && ( <MapPin/> {sellerLocation} )}
                 </div>
               </div>
-            )
-          }
+            );
+          })()}
```
*(See the file for the full expanded JSX; the shape above is the exact logic.)*

### 5.3 `src/components/All/dashboard/admin/AdminProductsClient.jsx`

> ⚠️ This file is **untracked** in git (no committed baseline), so it has no
> `git diff`. Changes shown as explicit before → after.

**(1) Search filter (~line 221):**
```js
// before
p.sellerInfo?.name?.toLowerCase().includes(q)
// after
(p.sellerInfo?.name || p.sellerName)?.toLowerCase().includes(q)
```
**(2) Table cell (~line 330):**
```js
// before
{product.sellerInfo?.name || "—"}
// after
{product.sellerInfo?.name || product.sellerName || "—"}
```
**(3) Edit dialog header (~line 476):**
```js
// before
Listed by {editTarget.sellerInfo?.name || "unknown seller"}
// after
Listed by {editTarget.sellerInfo?.name || editTarget.sellerName || "unknown seller"}
```
*(The view dialog at ~lines 380–381 already had `sellerInfo?.name || sellerName`
and `sellerInfo?.email || sellerEmail` fallbacks — left unchanged.)*

---

## 6. The `userId` type fix (why `.toString()`)

For a future `sellerInfo.userId → user._id` `$lookup`/join to work, the type must
be deterministic. Because `getAuthUser` round-trips the user through Redis as JSON,
`req.dbUser._id` is a **string on a cache hit** but a BSON **`ObjectId` on a cache
miss**. The codebase convention (`recordPurchase`: `buyerInfo.userId:
buyer._id.toString()`) is **string**, and IDs are converted back with
`new ObjectId(str)` at query time (e.g. `findProductById`). So we store
`req.dbUser?._id?.toString()` → always a string, joinable by converting at query
time.

---

## 7. Architecture notes (how product links to user)

Four ways to connect `products` ↔ `user`:

1. **Denormalize at write (what we do).** Copy `location1`/`mobile1`/`sellerName`
   into the product at create time; keep `userId` as a reference. Reads are pure
   single-collection (cacheable). Downside: snapshot goes stale on profile edit →
   solved by §4.5 propagation.
2. **Reference + join on read.** Store only `userId`, `$lookup` to `user` each read.
   Always live, but every read pays the join and is hard to cache.
3. **Hybrid.** Store the snapshot *and* `userId` (we effectively do this).
4. **Lazy read-repair (versioned snapshot).** Snapshot valid until seller writes;
   next read that touches that seller detects staleness (via a version/`updatedAt`
   compare) and re-materializes. Powerful but adds read-path writes, thundering-herd
   risk, and interacts badly with the existing `PRODUCTS_DEFAULT_KEY` / ISR caches.
   **Not used** — too complex for this project's tiny, rare fan-out.

**Chosen propagation strategy: synchronous ("eager") `updateMany`, not async
fire-and-forget**, because:
- The **backup backend runs on Vercel serverless** (`REMOTE_BACKUP_SERVER_URL`),
  where work kicked off *after* the HTTP response may be frozen/killed and never
  run → fire-and-forget would silently drop propagation.
- The fan-out is tiny (one seller's own listings) and keyed by the **indexed**
  `sellerEmail`, so the synchronous cost is negligible.
- No job queue exists in the stack → async would have no durability/retry.

---

## 8. Behavior & gotchas (read this when debugging)

- **Dual-shape reads are intentional.** Old (un-migrated) docs use
  `sellerInfo.{name,email,phone}`; new docs use top-level `sellerName`/`sellerEmail`
  + `sellerInfo.contact.{mobile1,mobile2}`. Any **new** code reading seller fields
  off a product must handle both (pattern:
  `sellerInfo?.name || sellerName`, `sellerInfo?.email || sellerEmail`,
  `sellerInfo?.phone || sellerInfo?.contact?.mobile1`).
- **Snapshot freshness:** on seller profile edit, `sellerName` / `location1` /
  `sellerInfo.contact.mobile1` are refreshed across that seller's listings in the
  same request (§4.5). Only the **changed** fields propagate; `location2` /
  `contact.mobile2` (per-listing overrides) and `sellerInfo.userId` are never
  touched (dot-notation `$set`).
- **ISR lag ≤ 60s:** the backend busts `PRODUCTS_DEFAULT_KEY` immediately, but the
  Next.js public reads (`/`, `/products`) revalidate every 60s — a seller change can
  take up to a minute to appear on public pages. Expected; not a bug.
- **Best-effort propagation:** if the `updateMany` throws, the profile save still
  succeeds and the error is logged (`[profile] snapshot propagation failed ...`);
  snapshots stay stale until the seller's next edit.
- **`quantity` is now persisted** (was silently dropped before).
- **`dateUploaded` is gone** on new docs → see §9 follow-up on the sort key.
- **Orders/payments unaffected:** they still resolve seller email/name/phone from
  the product with fallbacks; keeping top-level `sellerEmail`/`sellerName` + the
  new phone fallback (§4.2) keeps them intact.
- **Deployment:** the stored shape only changes once `Kino_ServerSide_Render` is
  deployed to Onrender. Frontend changes alone cannot enforce it.

---

## 9. Open follow-ups

- **`products.controller.js › list` sort key** — new docs have `createdAt`, not
  `dateUploaded`. The fix `sort === "dateUploaded"` → `sort === "createdAt"` was
  **applied outside this conversation's edits** (it shows as a 1-line modification
  in that file). The `status_category_date` index still indexes `dateUploaded`;
  revisit if `createdAt` sorting needs an index.
- **Seller inline edit** (`seller/products/page.jsx`) still edits only
  title/category/condition/price/description — it does not let sellers edit the new
  `quantity` / `location2` / `mobile2` fields (doesn't corrupt them either).
- **Optional migration** of existing dummy/old docs to the uniform shape — not done
  (Decision 1). Until then, keep the dual-shape reads.

---

## 10. Verification performed

- `node --check` on all backend files touched: **pass**
  (`sellerSnapshot.js`, `seller.controller.js`, `payments.service.js`,
  `profile.service.js`, `profile.controller.js`).
- `eslint` on the frontend files touched: no **new** issues. Pre-existing and
  unrelated: an `<img>` LCP warning in `add/page.jsx`, and a
  `react-hooks/set-state-in-effect` error at `AdminProductsClient.jsx:131`
  (untouched code).

---

## Appendix — files changed

| Repo | File | Type |
|------|------|------|
| backend | `src/modules/seller/seller.controller.js` | modified (createProduct) |
| backend | `src/modules/payments/payments.service.js` | modified (recordPurchase phone fallback) |
| backend | `src/lib/sellerSnapshot.js` | **new** |
| backend | `src/modules/profile/profile.service.js` | modified (+updateSellerProductSnapshots) |
| backend | `src/modules/profile/profile.controller.js` | modified (eager propagation) |
| frontend | `src/app/dashboard/seller/products/add/page.jsx` | modified (fields + 10-image cap) |
| frontend | `src/components/All/Products/ProductDetail.jsx` | modified (dual-shape panel) |
| frontend | `src/components/All/dashboard/admin/AdminProductsClient.jsx` | modified (fallbacks; untracked) |
| backend | `src/modules/products/products.controller.js` | ⚠️ 1-line change **not** from this work (sort key) |
</content>
