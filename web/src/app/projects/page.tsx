import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectsIndex } from "@/components/ProjectsIndex";
import { listEnabledProjectTypes, listPublishedProjects } from "@/lib/content";
import { canonicalizeTypeSlug } from "@/lib/project-taxonomy";

export const dynamic = "force-dynamic";

type Search = Promise<{ group?: string; type?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const sp = await searchParams;
  const group = sp.group || "";
  const type = canonicalizeTypeSlug(sp.type || "");
  const hasFilter = Boolean(group || type);
  // Filtered gallery URLs are shareable UX; keep a single indexable /projects canonical.
  return {
    title: hasFilter ? "Projects (filtered) — ZainCodes" : "Projects — ZainCodes",
    description: "Browse Client & Company and Freelance & Personal case studies by Web, Mobile, Full-Stack, AI, and more.",
    alternates: { canonical: "/projects" },
    robots: hasFilter ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function ProjectsPage({ searchParams }: { searchParams: Search }) {
  // Touch searchParams so Next keeps the route dynamic for shareable filters.
  await searchParams;

  let projects: Awaited<ReturnType<typeof listPublishedProjects>> = [];
  let types: Awaited<ReturnType<typeof listEnabledProjectTypes>> = [];
  try {
    [projects, types] = await Promise.all([listPublishedProjects(), listEnabledProjectTypes()]);
  } catch {
    projects = [];
    types = [];
  }

  return (
    <Suspense fallback={<main className="section projects-page"><div className="container"><p className="pg-empty">Loading projects…</p></div></main>}>
      <ProjectsIndex
        projects={projects}
        types={types.map((t) => ({
          id: t.id,
          slug: t.slug,
          name: t.name,
          description: t.description,
          icon: t.icon,
          sortOrder: t.sortOrder,
          enabled: t.enabled,
        }))}
      />
    </Suspense>
  );
}
