import { and, asc, eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/db/client";
import {
  aboutContent,
  contactContent,
  educationEntries,
  experienceEntries,
  heroContent,
  projectImages,
  projects,
  resumeAssets,
  seoEntries,
  services,
  siteSettings,
  skillCategories,
  skills,
  socialLinks,
} from "@/db/schema";
import { listProjectTypes, loadTypeSlugsForProjects } from "@/lib/project-types";
import { canonicalizeTypeSlug } from "@/lib/project-taxonomy";

export async function getHomeContent() {
  await ensureSchema();
  const db = getDb();

  const [settings] = await db.select().from(siteSettings).limit(1);
  const [hero] = await db.select().from(heroContent).limit(1);
  const [about] = await db.select().from(aboutContent).limit(1);
  const [contact] = await db.select().from(contactContent).limit(1);
  const social = await db.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder));
  const experience = await db.select().from(experienceEntries).orderBy(asc(experienceEntries.sortOrder));
  const education = await db.select().from(educationEntries).orderBy(asc(educationEntries.sortOrder));
  const categories = await db.select().from(skillCategories).orderBy(asc(skillCategories.sortOrder));
  const skillRows = await db.select().from(skills).orderBy(asc(skills.sortOrder));
  const featuredProjects = await db
    .select()
    .from(projects)
    .where(and(eq(projects.status, "published"), eq(projects.isFeatured, 1)))
    .orderBy(asc(projects.sortOrder), asc(projects.id))
    .limit(8);

  const fallbackProjects =
    featuredProjects.length > 0
      ? featuredProjects
      : await db
          .select()
          .from(projects)
          .where(eq(projects.status, "published"))
          .orderBy(asc(projects.sortOrder), asc(projects.id))
          .limit(6);

  const homeProjectIds = fallbackProjects.map((p) => p.id);
  const homeTypeMap = await loadTypeSlugsForProjects(homeProjectIds);
  const projectTypes = await listProjectTypes();

  const [currentResume] = await db
    .select()
    .from(resumeAssets)
    .where(eq(resumeAssets.isCurrent, true))
    .limit(1);

  return {
    settings: settings || null,
    hero: hero || null,
    about: about || null,
    contact: contact || null,
    social,
    experience,
    education,
    skills: categories.map((cat) => ({
      ...cat,
      skills: skillRows.filter((s) => s.categoryId === cat.id),
    })),
    featuredProjects: fallbackProjects.map((project) => {
      const typeSlugs = homeTypeMap.get(project.id) || [canonicalizeTypeSlug(project.category)];
      return {
        id: project.id,
        slug: project.slug,
        title: project.title,
        category: typeSlugs[0] || project.category,
        workContext: project.workContext || "unassigned",
        categoryIcon: project.categoryIcon || null,
        needsGroupReview: project.needsGroupReview ?? 0,
        typeSlugs,
        description: project.description,
        coverUrl: project.coverUrl,
        thumbnailUrl: project.thumbnailUrl,
        videoUrl: project.videoUrl,
        videoPosterUrl: project.videoPosterUrl || null,
        previewStyle: project.previewStyle || "banner",
        showcaseMode: project.showcaseMode || "static",
        showcaseAutoplay: project.showcaseAutoplay ?? 1,
        slideshowIntervalMs: project.slideshowIntervalMs ?? 4200,
        imageFit: project.imageFit || "cover",
        bannerAspect: project.bannerAspect || "16/10",
        scrollPreview: project.scrollPreview ?? 0,
        showcaseImageOrder: (project.showcaseImageOrder as string[] | null) || [],
        isFeatured: project.isFeatured ?? 0,
        technologies: project.technologies,
        problem: project.problem,
        solution: project.solution,
        architecture: project.architecture,
        githubLink: project.githubLink,
        liveLink: project.liveLink,
        playStoreLink: project.playStoreLink,
      };
    }),
    projectTypes,
    resume: currentResume
      ? {
          id: currentResume.id,
          filename: currentResume.filename,
          url: `/api/resume`,
          bytes: currentResume.bytes,
        }
      : null,
  };
}

export async function listPublishedProjects() {
  await ensureSchema();
  const db = getDb();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.status, "published"))
    .orderBy(asc(projects.sortOrder), asc(projects.id));
  const images = await db.select().from(projectImages).orderBy(asc(projectImages.sortOrder));
  const typeMap = await loadTypeSlugsForProjects(rows.map((r) => r.id));
  const types = await listProjectTypes({ includeDisabled: true });

  return rows.map((project) => {
    const typeSlugs =
      typeMap.get(project.id) || [canonicalizeTypeSlug(project.category) || project.category].filter(Boolean);
    return {
      id: project.id,
      slug: project.slug,
      title: project.title,
      category: typeSlugs[0] || project.category,
      workContext: project.workContext || "unassigned",
      categoryIcon: project.categoryIcon || null,
      needsGroupReview: project.needsGroupReview ?? 0,
      typeSlugs,
      projectTypes: types.filter((t) => typeSlugs.includes(t.slug)),
      description: project.description,
      longDescription: project.longDescription,
      problem: project.problem,
      solution: project.solution,
      architecture: project.architecture,
      technologies: project.technologies,
      features: project.features,
      highlights: project.highlights,
      coverUrl: project.coverUrl,
      thumbnailUrl: project.thumbnailUrl,
      videoUrl: project.videoUrl,
      videoPosterUrl: project.videoPosterUrl || null,
      previewStyle: project.previewStyle || "banner",
      showcaseMode: project.showcaseMode || "static",
      showcaseAutoplay: project.showcaseAutoplay ?? 1,
      slideshowIntervalMs: project.slideshowIntervalMs ?? 4200,
      imageFit: project.imageFit || "cover",
      bannerAspect: project.bannerAspect || "16/10",
      scrollPreview: project.scrollPreview ?? 0,
      showcaseImageOrder: (project.showcaseImageOrder as string[] | null) || [],
      isFeatured: project.isFeatured ?? 0,
      playStoreLink: project.playStoreLink,
      liveLink: project.liveLink,
      githubLink: project.githubLink,
      screenshots: images
        .filter((img) => img.projectId === project.id)
        .map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder,
          isCover: img.isCover,
        })),
    };
  });
}

export async function listEnabledProjectTypes() {
  return listProjectTypes();
}

export async function getProjectBySlug(slug: string) {
  const all = await listPublishedProjects();
  return all.find((p) => p.slug === slug) || null;
}

export async function listPublishedServices() {
  await ensureSchema();
  const db = getDb();
  return db
    .select()
    .from(services)
    .where(eq(services.status, "published"))
    .orderBy(asc(services.sortOrder));
}

export async function getSeo(entityType: string, entityKey: string) {
  await ensureSchema();
  const db = getDb();
  const [row] = await db
    .select()
    .from(seoEntries)
    .where(and(eq(seoEntries.entityType, entityType), eq(seoEntries.entityKey, entityKey)))
    .limit(1);
  return row || null;
}
