import { eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/db/client";
import { resumeAssets } from "@/db/schema";
import { apiError, handleRouteError } from "@/lib/http";
import { getStorage } from "@/lib/storage";

export async function GET() {
  try {
    await ensureSchema();
    const db = getDb();
    const [current] = await db
      .select()
      .from(resumeAssets)
      .where(eq(resumeAssets.isCurrent, true))
      .limit(1);

    if (!current) {
      return apiError("NOT_FOUND", "No published resume uploaded yet.");
    }

    const file = await getStorage().read(current.storageKey);
    if (!file) {
      return apiError("NOT_FOUND", "Resume file missing from storage.");
    }

    return new Response(new Uint8Array(file.data), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${current.filename.replace(/"/g, "")}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
