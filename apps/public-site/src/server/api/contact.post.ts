/**
 * API Route: POST /api/contact
 * 
 * Securely handles contact form submissions with:
 * - Server-side input validation
 * - Rate limiting to prevent spam
 * - Error handling
 * 
 * Request body:
 * {
 *   name: string
 *   org: string
 *   email: string
 *   message: string
 * }
 */

import { validateContactMessage } from "@shared/validation";
import { checkRateLimit, getRateLimitStatus } from "@shared/rate-limit";
import { submitContact } from "@shared/supabase";
import { getTenantSlug } from "@shared/tenant";

/**
 * Handler for POST /api/contact
 * Validates, rate limits, and submits contact form data
 */
export default defineEventHandler(async (event) => {
  // Only allow POST requests
  if (event.req.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    const body = await readBody(event);

    // Get client IP for rate limiting
    const clientIp = getClientIP(event);
    if (!clientIp) {
      throw createError({
        statusCode: 400,
        statusMessage: "Unable to identify client",
      });
    }

    // Check rate limit
    const rateLimitKey = `contact:${clientIp}`;
    if (!checkRateLimit(rateLimitKey)) {
      const status = getRateLimitStatus(rateLimitKey);
      setResponseHeader(event, "Retry-After", Math.ceil((status.resetTime - Date.now()) / 1000).toString());
      throw createError({
        statusCode: 429,
        statusMessage: "Too Many Requests",
        data: { 
          error: "Too many contact submissions. Please try again later.",
          retryAfter: status.resetTime,
        },
      });
    }

    // Validate input
    const validation = validateContactMessage(body);
    if (!validation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: { errors: validation.errors },
      });
    }

    // Extract tenant slug from request host headers
    const hostHeader = event.req.headers["x-forwarded-host"] || event.req.headers.host;
    const host = typeof hostHeader === "string" ? hostHeader : Array.isArray(hostHeader) ? hostHeader[0] : "localhost";
    const tenantSlug = getTenantSlug(host) ?? undefined;

    // Submit to database
    const result = await submitContact(
      {
        name: body.name.trim(),
        org: body.org.trim(),
        email: body.email.trim().toLowerCase(),
        message: body.message.trim(),
      },
      tenantSlug,
    );

    setResponseHeader(event, "Content-Type", "application/json");
    return {
      success: true,
      id: result.id,
      message: "Contact message submitted successfully",
    };
  } catch (error) {
    console.error("Contact form error:", error);

    // Re-throw HTTP errors
    if (error instanceof Error && (error as any).statusCode) {
      throw error;
    }

    // Handle other errors
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      data: { error: "Failed to submit contact form" },
    });
  }
});

/**
 * Get client IP address from request
 * Handles proxies and load balancers
 */
function getClientIP(event: any): string | null {
  const req = event.req;
  
  // Check for X-Forwarded-For header (proxies)
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return (typeof forwarded === "string" ? forwarded : forwarded[0]).split(",")[0].trim();
  }
  
  // Check for X-Real-IP header
  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return typeof realIp === "string" ? realIp : realIp[0];
  }
  
  // Fallback to connection remote address
  return req.socket?.remoteAddress ?? null;
}
