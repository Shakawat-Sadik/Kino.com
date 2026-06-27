// Superseded — image uploads are now handled by the Express backend.
// POST /upload on the Express server (via uploadImage() in action.js)
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, message: "This route is no longer active. Use uploadImage() from action.js." },
    { status: 410 }
  );
}
