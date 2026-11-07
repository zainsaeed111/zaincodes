import { revalidatePath } from "next/cache";

/** Invalidate public surfaces after admin CMS writes (no redeploy needed). */
export function revalidateSiteSurfaces(opts?: { projectSlug?: string | null; serviceSlug?: string | null }) {
  try {
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/api/projects");
    revalidatePath("/api/content/home");
    revalidatePath("/sitemap.xml");
    if (opts?.projectSlug) {
      revalidatePath(`/portfolio/${opts.projectSlug}`);
      revalidatePath(`/api/projects/${opts.projectSlug}`);
    }
    if (opts?.serviceSlug) {
      revalidatePath(`/services/${opts.serviceSlug}`);
    } else {
      // Service list edits — refresh all known service landings lightly via layout/home.
      revalidatePath("/services/web-development");
      revalidatePath("/services/full-stack-development");
      revalidatePath("/services/mobile-app-development");
    }
  } catch {
    // Ignore outside request context (scripts/tests).
  }
}
