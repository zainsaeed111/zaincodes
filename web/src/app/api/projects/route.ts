import { apiOk, handleRouteError } from "@/lib/http";
import { listPublishedProjects } from "@/lib/content";

export async function GET() {
  try {
    const projects = await listPublishedProjects();
    return apiOk({ projects, count: projects.length });
  } catch (err) {
    return handleRouteError(err);
  }
}
