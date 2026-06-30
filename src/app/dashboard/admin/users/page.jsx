"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  getAdminUsers,
  updateUserStatus,
  updateAdminUser,
  deleteUser,
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
import { StatefulButton } from "@/components/motion/button/stateful";
import {
  Users,
  Search,
  X,
  ShieldOff,
  ShieldCheck,
  Trash2,
  Pencil,
  User,
  Phone,
  MapPin,
  Eye,
  Mail,
  Calendar,
  ShieldCheck as RoleIcon,
} from "lucide-react";
import { SpecializedPagination } from "@/components/All/dashboard/shared/SpecializedPagination";

const ROLES = ["All", "buyer", "seller", "admin"];
const EDIT_ROLES = ["buyer", "seller", "admin"];
const STATUSES = ["All", "active", "blocked"];
const PAGE_LIMIT = 10;

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Edit dialog state
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", role: "", location: "", contact: "" });
  const [editState, setEditState] = useState("idle");

  // View dialog state
  const [viewTargetId, setViewTargetId] = useState(null);
  const viewTarget = users.find((u) => u._id === viewTargetId) || null;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const query = { page, limit: PAGE_LIMIT };
      if (roleFilter !== "All") query.role = roleFilter;
      if (statusFilter !== "All") query.status = statusFilter;
      const res = await getAdminUsers(query);
      if (!cancelled) {
        setUsers(res.success ? res.result : []);
        setTotal(res.total ?? 0);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, roleFilter, statusFilter]);

  const openEdit = (user) => {
    const loc = user.location;
    const locationStr =
      loc && typeof loc === "object"
        ? [loc.area, loc.district, loc.division, loc.country].filter(Boolean).join(", ")
        : loc || "";
    setEditForm({
      name: user.name || "",
      role: user.role || "buyer",
      location: locationStr,
      contact: user.contact ? String(user.contact) : "",
    });
    setEditTarget(user);
    setEditState("idle");
    setViewTargetId(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (editState === "loading") return;
    setEditState("loading");
    const res = await updateAdminUser(editTarget._id, editForm);
    if (res.success) {
      setEditState("success");
      toast.success("User updated");
      setUsers((prev) =>
        prev.map((u) =>
          u._id === editTarget._id ? { ...u, ...editForm } : u
        )
      );
      setTimeout(() => setEditTarget(null), 800);
    } else {
      setEditState("error");
      toast.error(res.message || "Failed to update user");
      setTimeout(() => setEditState("idle"), 2000);
    }
  };

  const handleToggleStatus = async (user) => {
    const next = user.status === "blocked" ? "active" : "blocked";
    setBusy(user._id);
    const res = await updateUserStatus(user._id, next);
    if (res.success) {
      toast.success(`User ${next === "active" ? "unblocked" : "blocked"}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: next } : u))
      );
    } else {
      toast.error(res.message || "Failed to update status");
    }
    setBusy(null);
  };

  const handleDelete = async (userId) => {
    setBusy(userId);
    const res = await deleteUser(userId);
    if (res.success) {
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setViewTargetId((prev) => (prev === userId ? null : prev));
    } else {
      toast.error(res.message || "Failed to delete user");
    }
    setBusy(null);
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
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
        <Select value={roleFilter} onValueChange={(val) => { setPage(1); setRoleFilter(val); }}>
          <SelectTrigger className="w-full sm:w-36 bg-card">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                <span className="capitalize">{r}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(val) => { setPage(1); setStatusFilter(val); }}>
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
        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-full rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No users found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || roleFilter !== "All" || statusFilter !== "All"
                ? "Try changing your filters"
                : "No users registered yet"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground pl-5">User</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Role</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Phone</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Location</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {filtered.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="border-border"
                  >
                    <TableCell className="pl-5 py-4">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold capitalize text-muted-foreground">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {user.contact ? String(user.contact) : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground truncate max-w-30 block">
                        {user.location
                          ? typeof user.location === "object"
                            ? [user.location.area, user.location.district, user.location.division, user.location.country].filter(Boolean).join(", ")
                            : user.location
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.status || "active"} />
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex items-center justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => setViewTargetId(user._id)}
                        >
                          <Eye className="h-3 w-3" />
                          View
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
          page={page}
          total={total}
          limit={PAGE_LIMIT}
          onPageChange={setPage}
        />
      </div>

      {/* View user dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(open) => { if (!open) setViewTargetId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <>
              <div className="space-y-0.5">
                <DetailRow icon={User} label="Full Name" value={viewTarget.name} />
                <DetailRow icon={Mail} label="Email" value={viewTarget.email} />
                <DetailRow icon={RoleIcon} label="Role" value={viewTarget.role} />
                <DetailRow icon={Phone} label="Phone" value={viewTarget.contact ? String(viewTarget.contact) : ""} />
                <DetailRow
                  icon={MapPin}
                  label="Location"
                  value={
                    viewTarget.location
                      ? typeof viewTarget.location === "object"
                        ? [viewTarget.location.area, viewTarget.location.district, viewTarget.location.division, viewTarget.location.country].filter(Boolean).join(", ")
                        : viewTarget.location
                      : ""
                  }
                />
                <DetailRow
                  icon={Calendar}
                  label="Joined"
                  value={viewTarget.createdAt ? new Date(viewTarget.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" }) : ""}
                />
                <div className="flex items-center gap-3 py-2.5">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-muted shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Status</p>
                    <StatusBadge status={viewTarget.status || "active"} />
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

                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs gap-1 ${
                    viewTarget.status === "blocked"
                      ? "text-green-600 border-green-500/30 hover:bg-green-500/10"
                      : "text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/10"
                  }`}
                  disabled={busy === viewTarget._id}
                  onClick={() => handleToggleStatus(viewTarget)}
                >
                  {viewTarget.status === "blocked" ? (
                    <><ShieldCheck className="h-3 w-3" />Unblock</>
                  ) : (
                    <><ShieldOff className="h-3 w-3" />Block</>
                  )}
                </Button>

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
                      <AlertDialogTitle>Delete {viewTarget.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the account and all associated data. This action cannot be undone.
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

      {/* Edit user dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Edit User</DialogTitle>
            {editTarget && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{editTarget.email}</p>
            )}
          </DialogHeader>
          <Separator />
          <form onSubmit={handleEditSave} className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="flex items-center gap-1.5 text-xs">
                <User className="h-3.5 w-3.5" /> Full Name
              </Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Full name"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role" className="flex items-center gap-1.5 text-xs">
                <ShieldCheck className="h-3.5 w-3.5" /> Role
              </Label>
              <Select
                value={editForm.role}
                onValueChange={(val) => setEditForm((p) => ({ ...p, role: val }))}
              >
                <SelectTrigger id="edit-role" className="bg-background">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {EDIT_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      <span className="capitalize">{r}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contact" className="flex items-center gap-1.5 text-xs">
                <Phone className="h-3.5 w-3.5" /> Phone / Contact
              </Label>
              <Input
                id="edit-contact"
                value={editForm.contact}
                onChange={(e) => setEditForm((p) => ({ ...p, contact: e.target.value }))}
                placeholder="+880 17XX XXXXXX"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location" className="flex items-center gap-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5" /> Location
              </Label>
              <Input
                id="edit-location"
                value={editForm.location}
                onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="Dhaka, Bangladesh"
                className="bg-background"
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
