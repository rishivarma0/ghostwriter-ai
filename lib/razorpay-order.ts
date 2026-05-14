/** Minimal shape returned by `POST /api/razorpay` (order JSON or API error body). */
export type RazorpayOrderJson = {
  id?: string;
  amount?: number;
  currency?: string;
  error?: string | { description?: string };
  message?: string;
};

export function parseRazorpayOrderJson(raw: string): RazorpayOrderJson {
  if (!raw.trim()) return { error: "Empty server response from /api/razorpay." };
  try {
    return JSON.parse(raw) as RazorpayOrderJson;
  } catch {
    return { error: raw || "Invalid JSON from /api/razorpay." };
  }
}
