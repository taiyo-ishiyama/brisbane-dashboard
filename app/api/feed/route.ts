import { getDashboardFeed } from "@/lib/services/dashboard.service";

export async function GET() {
  try {
    const feed = await getDashboardFeed();
    return Response.json(feed);
  } catch (err) {
    console.error("[api/feed]", err);
    return Response.json(
      { error: "Failed to load dashboard feed" },
      { status: 500 },
    );
  }
}
