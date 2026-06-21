"use server";
import { getAuthHeaders } from "./integra";

const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REMOTE_SERVER_URL
    : process.env.SERVER_URL || "http://localhost:5000";
// ─────────────────────────────────────
// Helper: Core fetch wrapper
// ─────────────────────────────────────
async function fetchAPI(endpoint, options = {}) {
  const protectedEndpoints = ["/dashboard", "/my-products", "/my-orders", "/profile", "/profile/", "/wishlist", "/reviews"];

  const needsAuth = protectedEndpoints.some((route) =>
    endpoint.startsWith(route),
  );

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (needsAuth) {
    const token = await getAuthHeaders();
    console.log("Token in fetchAPI:", token); // Debug log to verify token presence

    if (!token) {
      return { success: false, message: "Not authenticated", result: null };
    }
    
    headers.authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || `Request failed with status ${res.status}`,
        result: null,
      };
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    console.error("Message:", error.message);
    console.error("Cause:", error.cause);
    console.error("Stack:", error.stack);
    return {
      success: false,
      message: error.message || "Network error. Is the server running?",
      result: null,
    };
  }
}

// ─────────────────────────────────────
// DOCTOR ACTIONS
// ─────────────────────────────────────

/**
 * Fetch all doctors with optional search, sort, specialty, and limit
 */
export async function getDoctors(query = {}) {
  const params = new URLSearchParams();

  if (query.search) params.set("search", query.search);
  if (query.specialty) params.set("specialty", query.specialty);
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  if (query.limit) params.set("limit", String(query.limit));

  const queryString = params.toString();
  console.log("Query String for getDoctors:", queryString); // Debugging line
  const endpoint = `/doctors${queryString ? `?${queryString}` : ""}`;

  return await fetchAPI(endpoint);
}

/**
 * Fetch a single doctor by slug
 */
export async function getDoctorBySlug(slug) {
  return await fetchAPI(`/doctors/${slug}`);
}

// ─────────────────────────────────────
// APPOINTMENT ACTIONS
// ─────────────────────────────────────

/**
 * Fetch appointments for a specific user
 */
export async function getAppointments(email) {
  return await fetchAPI(`/appointments?email=${encodeURIComponent(email)}`);
}

/**
 * Fetch a single appointment by ID
 */
export async function getAppointmentById(id) {
  return await fetchAPI(`/appointments/${id}`);
}

/**
 * Create a new appointment
 */
export async function createAppointment(appointmentData) {
  return await fetchAPI("/appointments", {
    method: "POST",
    body: JSON.stringify({
      ...appointmentData,
      createdAt: new Date(),
      status: appointmentData.status || "Confirmed",
    }),
  });
}

/**
 * Update an existing appointment (only allowed fields)
 */
export async function updateAppointment(id, updateData) {
  const allowedFields = [
    "patientName",
    "gender",
    "phone",
    "appointmentDate",
    "appointmentTime",
    "notes",
    "status",
  ];

  const filteredData = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  return await fetchAPI(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(filteredData),
  });
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(id) {
  return await fetchAPI(`/appointments/${id}`, {
    method: "DELETE",
  });
}

// ─────────────────────────────────────
// REVIEW ACTIONS
// ─────────────────────────────────────

/**
 * Add a review for a doctor
 */
export async function addReview(doctorSlug, reviewData) {
  return await fetchAPI("/reviews", {
    method: "POST",
    body: JSON.stringify({
      ...reviewData,
      doctorSlug,
      createdAt: new Date(),
    }),
  });
}
