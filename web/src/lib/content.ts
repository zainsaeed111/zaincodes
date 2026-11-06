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
    .select({
      id: projects.id,
      slug: projects.slug,
      title: projects.title,
      category: projects.category,
      description: projects.description,
      coverUrl: projects.coverUrl,
      thumbnailUrl: projects.thumbnailUrl,
      videoUrl: projects.videoUrl,
      previewStyle: projects.previewStyle,
      technologies: projects.technologies,
      problem: projects.problem,
      solution: projects.solution,
      architecture: projects.architecture,
      githubLink: projects.githubLink,
      liveLink: projects.liveLink,
      playStoreLink: projects.playStoreLink,
    })
    .from(projects)
    .where(eq(projects.status, "published"))
    .orderBy(asc(projects.sortOrder))
    .limit(8);

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
    featuredProjects,
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

  return rows.map((project) => ({
    id: project.id,
    slug: project.slug,
    title: project.title,
    category: project.category,
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
    previewStyle: project.previewStyle || "banner",
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
  }));
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
