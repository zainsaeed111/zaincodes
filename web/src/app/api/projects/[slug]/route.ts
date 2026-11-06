import { apiError, apiOk, handleRouteError } from "@/lib/http";
import { getProjectBySlug, getSeo } from "@/lib/content";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const project = await getProjectBySlug(slug);
    if (!project) return apiError("NOT_FOUND", "Project not found.");
    const seo = await getSeo("project", slug);
    return apiOk({ project, seo });
  } catch (err) {
    return handleRouteError(err);
  }
}
