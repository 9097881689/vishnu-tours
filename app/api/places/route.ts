const googleApiKey =
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyB_rf7jHoCB8mWRNGi43G58mRA5z_50jbs";

type GoogleAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      text?: {
        text?: string;
      };
      structuredFormat?: {
        mainText?: {
          text?: string;
        };
        secondaryText?: {
          text?: string;
        };
      };
    };
  }>;
  error?: {
    message?: string;
  };
};

const fallbackFrom = [
  "Mumbai Airport",
  "BKC Mumbai",
  "Andheri Mumbai",
  "Bandra Mumbai",
  "Powai Mumbai",
  "Dadar Mumbai",
  "Mumbai Central",
  "Navi Mumbai",
];

const fallbackTo = [
  "Pune",
  "Nashik",
  "Surat",
  "Goa",
  "Delhi",
  "Bangalore",
  "Ahmedabad",
  "Hyderabad",
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const input = (url.searchParams.get("input") || "").trim();
  const field = url.searchParams.get("field") === "from" ? "from" : "to";

  if (!input) {
    return Response.json({ suggestions: fallback(field) });
  }

  if (!googleApiKey) {
    return Response.json({ suggestions: fallback(field, input) });
  }

  const body: Record<string, unknown> = {
    input,
    includedRegionCodes: ["in"],
  };

  if (field === "from") {
    body.locationRestriction = {
      rectangle: {
        low: { latitude: 18.82, longitude: 72.72 },
        high: { latitude: 19.45, longitude: 73.25 },
      },
    };
  }

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": googleApiKey,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
      },
      body: JSON.stringify(body),
    });
    const result = (await response.json()) as GoogleAutocompleteResponse;

    if (!response.ok) {
      return Response.json(
        {
          suggestions: fallback(field, input),
          error: result.error?.message || "Google Places suggestions unavailable.",
        },
        { status: 200 },
      );
    }

    const suggestions =
      result.suggestions
        ?.map((item) => {
          const prediction = item.placePrediction;
          const label =
            prediction?.structuredFormat?.mainText?.text ||
            prediction?.text?.text ||
            "";
          const secondary = prediction?.structuredFormat?.secondaryText?.text;

          return label
            ? {
                label,
                secondary:
                  field === "from"
                    ? secondary || "Mumbai pickup"
                    : secondary || "India destination",
              }
            : null;
        })
        .filter(Boolean)
        .slice(0, 8) || [];

    return Response.json({
      suggestions: suggestions.length ? suggestions : fallback(field, input),
    });
  } catch {
    return Response.json({ suggestions: fallback(field, input) });
  }
}

function fallback(field: "from" | "to", input = "") {
  const source = field === "from" ? fallbackFrom : fallbackTo;
  const normalizedInput = input.toLowerCase();

  return source
    .filter((item) => !normalizedInput || item.toLowerCase().includes(normalizedInput))
    .slice(0, 8)
    .map((label) => ({
      label,
      secondary: field === "from" ? "Mumbai pickup" : "Popular destination",
    }));
}
