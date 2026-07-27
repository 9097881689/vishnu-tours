export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (!keyId || !keySecret) {
    return Response.json(
      { error: "Razorpay credentials are not configured." },
      { status: 503 },
    );
  }

  const payload = (await request.json()) as {
    amount?: number;
    receipt?: string;
    notes?: Record<string, string>;
  };
  const amount = Number(payload.amount);

  if (!Number.isFinite(amount) || amount < 100) {
    return Response.json(
      { error: "Minimum payment amount is Rs. 1." },
      { status: 400 },
    );
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount),
      currency: "INR",
      receipt: payload.receipt || `vishnu-${Date.now()}`,
      notes: payload.notes || {},
    }),
  });

  const result = (await response.json()) as { id?: string; error?: unknown };

  if (!response.ok || !result.id) {
    return Response.json(
      { error: "Unable to create Razorpay order.", detail: result.error },
      { status: 502 },
    );
  }

  return Response.json({
    keyId,
    orderId: result.id,
  });
}
