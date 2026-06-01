/**
 * Server-side input validation utilities
 * Validates all user inputs before they are saved to the database
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a contact form submission
 */
export function validateContactMessage(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof data !== "object" || data === null) {
    return {
      isValid: false,
      errors: [{ field: "root", message: "Invalid request data" }],
    };
  }

  const obj = data as Record<string, unknown>;

  // Validate name
  const name = obj.name?.toString().trim() ?? "";
  if (!name) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (name.length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters" });
  } else if (name.length > 100) {
    errors.push({ field: "name", message: "Name must not exceed 100 characters" });
  }

  // Validate organization
  const org = obj.org?.toString().trim() ?? "";
  if (!org) {
    errors.push({ field: "org", message: "Organization is required" });
  } else if (org.length < 2) {
    errors.push({ field: "org", message: "Organization must be at least 2 characters" });
  } else if (org.length > 150) {
    errors.push({ field: "org", message: "Organization must not exceed 150 characters" });
  }

  // Validate email
  const email = obj.email?.toString().trim() ?? "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!emailRegex.test(email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  } else if (email.length > 255) {
    errors.push({ field: "email", message: "Email must not exceed 255 characters" });
  }

  // Validate message
  const message = obj.message?.toString().trim() ?? "";
  if (!message) {
    errors.push({ field: "message", message: "Message is required" });
  } else if (message.length < 10) {
    errors.push({ field: "message", message: "Message must be at least 10 characters" });
  } else if (message.length > 5000) {
    errors.push({ field: "message", message: "Message must not exceed 5000 characters" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes a string input to prevent XSS attacks
 */
export function sanitizeString(value: string): string {
  return value
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, 5000);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 255;
}

/**
 * Validates a string length
 */
export function isValidLength(value: string, min: number, max: number): boolean {
  const length = value.trim().length;
  return length >= min && length <= max;
}
