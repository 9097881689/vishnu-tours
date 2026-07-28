const googleApiKey =
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyB_rf7jHoCB8mWRNGi43G58mRA5z_50jbs";

type RouteResponse = {
  routes?: Array<{
    distanceMeters?: number;
  }>;
  error?: {
    message?: string;
  };
};

type DistancePayload = {
  origin?: string;
  destination?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as DistancePayload;
  const origin = cleanAddress(payload.origin, "Mumbai, Maharashtra, India");
  const destination = cleanAddress(payload.destination, "India");

  if (!origin || !destination) {
    return Response.json({ error: "Origin and destination are required." }, { status: 400 });
  }

  if (!googleApiKey) {
    return Response.json({ error: "Google API key is not configured." }, { status: 503 });
  }

  try {
    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": googleApiKey,
        "X-Goog-FieldMask": "routes.distanceMeters",
      },
      body: JSON.stringify({
        origin: { address: origin },
        destination: { address: destination },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE",
      }),
    });
    const result = (await response.json()) as RouteResponse;
    const distanceMeters = result.routes?.[0]?.distanceMeters;

    if (!response.ok || !distanceMeters) {
      return Response.json(
        { error: result.error?.message || "Google distance unavailable." },
        { status: 502 },
      );
    }

    return Response.json({
      distanceKm: Math.ceil(distanceMeters / 1000),
      distanceMeters,
    });
  } catch {
    return Response.json({ error: "Google distance unavailable." }, { status: 502 });
  }
}

function cleanAddress(value: unknown, suffix: string) {
  const address = typeof value === "string" ? value.trim() : "";

  if (!address) {
    return "";
  }

  return address.toLowerCase().includes(suffix.toLowerCase())
    ? address
    : `${address}, ${suffix}`;
}
