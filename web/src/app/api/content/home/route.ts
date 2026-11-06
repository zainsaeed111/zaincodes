import { apiOk, handleRouteError } from "@/lib/http";
import { getHomeContent, getSeo } from "@/lib/content";

export async function GET() {
  try {
    const content = await getHomeContent();
    const seo = await getSeo("page", "home");
    return apiOk({ ...content, seo });
  } catch (err) {
    return handleRouteError(err);
  }
}
