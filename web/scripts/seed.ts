import fs from "node:fs";
import path from "node:path";
import { and, count, eq } from "drizzle-orm";
import { ensureSchema, getDb } from "../src/db/client";
import {
  aboutContent,
  contactContent,
  educationEntries,
  experienceEntries,
  heroContent,
  projectImages,
  projects,
  seoEntries,
  services,
  siteSettings,
  skillCategories,
  skills,
  socialLinks,
  users,
} from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";

type PortfolioJson = {
  heroData: {
    title: string;
    greeting: string;
    description: string;
    badge: string;
    avatarUrl?: string;
    statApps: number;
    statYears: number;
    statSatisfaction: number;
  };
  aboutData: {
    subtitle: string;
    introTitle: string;
    introText: string;
    location?: string;
    email?: string;
    phone?: string;
    company?: string;
    experience?: string;
    education?: string;
    techStack?: Array<{ name: string; icon?: string; color?: string }>;
  };
  skillsData: Array<{
    title: string;
    icon?: string;
    skills: Array<{ name: string; level: number; color?: string }>;
  }>;
  contactData: { email: string; phone: string; location: string };
  socialLinks: Array<{ name: string; icon?: string; url: string }>;
  portfolioProjects: Array<{
    id: number;
    slug: string;
    title: string;
    category: string;
    image?: string;
    thumbnail?: string;
    description?: string;
    longDescription?: string;
    problem?: string;
    solution?: string;
    architecture?: string;
    technologies?: string[];
    features?: string[];
    highlights?: string[];
    screenshots?: string[];
    playStoreLink?: string;
    githubLink?: string;
    liveLink?: string;
    videoUrl?: string;
  }>;
  resumeLink?: string;
  siteTheme?: string;
};

async function upsertSingletonHero(data: PortfolioJson["heroData"]) {
  const db = getDb();
  const existing = await db.select().from(heroContent).limit(1);
  const values = {
    badge: data.badge || "Available for Web, Full-Stack & Mobile Projects",
    badgeEnabled: 1,
    greeting: data.greeting,
    title: data.title,
    description: data.description,
    avatarUrl: data.avatarUrl || "/Profile.webp",
    statApps: data.statApps,
    statYears: data.statYears,
    statSatisfaction: data.statSatisfaction,
    updatedAt: new Date(),
  };
  if (existing[0]) {
    await db.update(heroContent).set(values).where(eq(heroContent.id, existing[0].id));
  } else {
    await db.insert(heroContent).values(values);
  }
}

async function main() {
  const mode = (process.env.SEED_MODE || "upsert").toLowerCase();
  const jsonPath =
    process.env.PORTFOLIO_JSON_PATH ||
    path.resolve(process.cwd(), "..", "src", "data", "portfolioData.json");

  if (!fs.existsSync(jsonPath)) {
    throw new Error(`portfolioData.json not found at ${jsonPath}`);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as PortfolioJson;
  await ensureSchema();
  const db = getDb();

  const adminEmail = (process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@zaincodes.local").toLowerCase();
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) {
    throw new Error("Set ADMIN_BOOTSTRAP_PASSWORD in web/.env.local (min 12 chars) before seeding.");
  }

  const existingAdmins = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  const passwordHash = await hashPassword(adminPassword);
  if (!existingAdmins.length) {
    await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      role: "admin",
    });
    console.log(`Created admin user: ${adminEmail}`);
  } else {
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.email, adminEmail));
    console.log(`Synced admin password from .env.local for ${adminEmail}`);
  }

  if (mode === "fresh") {
    console.warn("SEED_MODE=fresh requested — refusing destructive wipe in Phase 2 safety mode.");
    console.warn("Use upsert (default) to safely refresh content without deleting data.");
  }

  // Site settings singleton
  const settingsRows = await db.select().from(siteSettings).limit(1);
  const settingsValues = {
    brandName: "ZainCodes",
    theme: data.siteTheme || "dark",
    whatsappE164: data.contactData.phone?.replace(/[^\d+]/g, "") || null,
    footerBlurb:
      "High-performance native Android & Flutter mobile application development, powered by robust REST API architecture.",
    resumeLink: data.resumeLink || "",
    updatedAt: new Date(),
  };
  if (settingsRows[0]) {
    await db.update(siteSettings).set(settingsValues).where(eq(siteSettings.id, settingsRows[0].id));
  } else {
    await db.insert(siteSettings).values(settingsValues);
  }

  await upsertSingletonHero(data.heroData);

  const aboutRows = await db.select().from(aboutContent).limit(1);
  const aboutValues = {
    subtitle: data.aboutData.subtitle,
    introTitle: data.aboutData.introTitle,
    introText: data.aboutData.introText,
    location: data.aboutData.location,
    email: data.aboutData.email,
    phone: data.aboutData.phone,
    company: data.aboutData.company,
    experienceSummary: data.aboutData.experience,
    educationSummary: data.aboutData.education,
    techStack: data.aboutData.techStack || [],
    updatedAt: new Date(),
  };
  if (aboutRows[0]) {
    await db.update(aboutContent).set(aboutValues).where(eq(aboutContent.id, aboutRows[0].id));
  } else {
    await db.insert(aboutContent).values(aboutValues);
  }

  const contactRows = await db.select().from(contactContent).limit(1);
  const contactValues = {
    email: data.contactData.email,
    phone: data.contactData.phone,
    location: data.contactData.location,
    updatedAt: new Date(),
  };
  if (contactRows[0]) {
    await db.update(contactContent).set(contactValues).where(eq(contactContent.id, contactRows[0].id));
  } else {
    await db.insert(contactContent).values(contactValues);
  }

  // Experience / education structured from summaries (idempotent replace of seed-owned rows)
  const [{ value: expCount }] = await db.select({ value: count() }).from(experienceEntries);
  if (expCount === 0 && data.aboutData.experience) {
    await db.insert(experienceEntries).values({
      title: "Mobile Application Developer",
      company: data.aboutData.company || null,
      location: data.aboutData.location || null,
      summary: data.aboutData.experience,
      sortOrder: 0,
    });
  }
  const [{ value: eduCount }] = await db.select({ value: count() }).from(educationEntries);
  if (eduCount === 0 && data.aboutData.education) {
    await db.insert(educationEntries).values({
      school: data.aboutData.education,
      degree: "BS Computer Science",
      summary: data.aboutData.education,
      sortOrder: 0,
    });
  }

  // Social: replace only when empty to avoid wiping admin edits later
  const [{ value: socialCount }] = await db.select({ value: count() }).from(socialLinks);
  if (socialCount === 0 && data.socialLinks?.length) {
    await db.insert(socialLinks).values(
      data.socialLinks.map((s, idx) => ({
        name: s.name,
        icon: s.icon,
        url: s.url,
        sortOrder: idx,
      })),
    );
  }

  // Skills: seed only when empty
  const [{ value: skillCatCount }] = await db.select({ value: count() }).from(skillCategories);
  if (skillCatCount === 0) {
    for (const [catIdx, cat] of data.skillsData.entries()) {
      const [inserted] = await db
        .insert(skillCategories)
        .values({ title: cat.title, icon: cat.icon, sortOrder: catIdx })
        .returning();
      if (cat.skills?.length) {
        await db.insert(skills).values(
          cat.skills.map((skill, skillIdx) => ({
            categoryId: inserted.id,
            name: skill.name,
            level: skill.level,
            color: skill.color,
            sortOrder: skillIdx,
          })),
        );
      }
    }
  }

  // SEO service pages — upsert published (canonical copy also in services-content.ts)
  const defaultServices = [
    {
      slug: "web-development",
      title: "Web Development",
      summary: "Product sites and customer-facing interfaces with clear hierarchy and maintainable structure.",
      body: "Marketing sites, dashboards, and customer-facing web apps with accessibility and SEO in delivery.",
      capabilities: ["Next.js / React", "Responsive UI", "SEO foundations"],
    },
    {
      slug: "full-stack-development",
      title: "Full-Stack Development",
      summary: "APIs, auth, data models, and clients designed as one coherent product system.",
      body: "Coherent UI/API contracts, reliable authentication, and data models matched to real workflows.",
      capabilities: ["API design", "Auth & sessions", "Data modeling"],
    },
    {
      slug: "mobile-app-development",
      title: "Mobile App Development",
      summary: "Android and Flutter applications from architecture through store-ready release.",
      body: "Native Android and Flutter apps with clean architecture, API integration, and store hygiene.",
      capabilities: ["Android", "Flutter", "Store readiness"],
    },
    {
      slug: "custom-software-development",
      title: "Custom Software Development",
      summary: "Software shaped around your workflows, integrations, and operational constraints.",
      body: "Internal tools, workflow systems, and productized services with honest scope and maintainable code.",
      capabilities: ["Internal tools", "Integrations", "Admin portals"],
    },
    {
      slug: "desktop-application-development",
      title: "Desktop Application Development",
      summary: "Desktop clients and companion tools when a browser or phone is not the right surface.",
      body: "Desktop-oriented work as part of a broader product system — utilities and operator tools beside web/mobile.",
      capabilities: ["Companion clients", "Offline-first", "OS workflows"],
    },
    {
      slug: "flutter-development",
      title: "Flutter Development",
      summary: "Cross-platform Flutter apps with careful state management and native-quality UI.",
      body: "Consistent UI across Android and iOS with maintainable module boundaries and API integration.",
      capabilities: ["Flutter", "State management", "Cross-platform UI"],
    },
    {
      slug: "android-development",
      title: "Android Development",
      summary: "Native Android engineering with Kotlin/Java, Jetpack, and production resilience.",
      body: "MVVM/Clean Architecture, Jetpack components, and pragmatic legacy Java interop when needed.",
      capabilities: ["Kotlin", "Jetpack", "Play Store"],
    },
  ];
  for (const [idx, svc] of defaultServices.entries()) {
    const existing = await db.select().from(services).where(eq(services.slug, svc.slug)).limit(1);
    const values = {
      title: svc.title,
      summary: svc.summary,
      body: svc.body,
      capabilities: svc.capabilities,
      href: null as string | null,
      status: "published" as const,
      sortOrder: idx,
      updatedAt: new Date(),
    };
    if (existing[0]) {
      await db.update(services).set(values).where(eq(services.id, existing[0].id));
    } else {
      await db.insert(services).values({ slug: svc.slug, ...values });
    }
  }

  // Projects upsert by slug — preserve every case-study field
  for (const [idx, project] of data.portfolioProjects.entries()) {
    const looksClient = /skans|institute|client|company|store|campus|insight/i.test(
      `${project.title} ${project.description || ""}`,
    );
    const payload = {
      legacyId: project.id,
      slug: project.slug,
      title: project.title,
      category: project.category,
      workContext: (looksClient ? "client" : "personal") as "client" | "personal",
      description: project.description,
      longDescription: project.longDescription,
      problem: project.problem,
      solution: project.solution,
      architecture: project.architecture,
      technologies: project.technologies || [],
      features: project.features || [],
      highlights: project.highlights || [],
      coverUrl: project.image || project.thumbnail,
      thumbnailUrl: project.thumbnail || project.image,
      videoUrl: project.videoUrl || null,
      playStoreLink: project.playStoreLink || null,
      liveLink: project.liveLink || null,
      githubLink: project.githubLink || null,
      status: "published" as const,
      sortOrder: idx,
      updatedAt: new Date(),
    };

    const existing = await db.select().from(projects).where(eq(projects.slug, project.slug)).limit(1);
    let projectId: number;
    if (existing[0]) {
      await db.update(projects).set(payload).where(eq(projects.id, existing[0].id));
      projectId = existing[0].id;
      await db.delete(projectImages).where(eq(projectImages.projectId, projectId));
    } else {
      const [inserted] = await db.insert(projects).values(payload).returning();
      projectId = inserted.id;
    }

    const shots = Array.isArray(project.screenshots) ? project.screenshots : [];
    const imageUrls = [project.thumbnail || project.image, project.image, ...shots].filter(
      (u, i, arr): u is string => Boolean(u) && arr.indexOf(u) === i,
    );
    if (imageUrls.length) {
      await db.insert(projectImages).values(
        imageUrls.map((url, imageIdx) => ({
          projectId,
          url,
          alt: `${project.title} screenshot ${imageIdx + 1}`,
          sortOrder: imageIdx,
          isCover: imageIdx === 0,
        })),
      );
    }

    const seoExisting = await db
      .select()
      .from(seoEntries)
      .where(and(eq(seoEntries.entityType, "project"), eq(seoEntries.entityKey, project.slug)))
      .limit(1);
    const seoValues = {
      entityType: "project",
      entityKey: project.slug,
      title: `${project.title} | ZainCodes Case Study`,
      description: project.description || project.longDescription || "",
      canonicalUrl: `/portfolio/${project.slug}`,
      ogImageUrl: project.image || project.thumbnail || null,
      updatedAt: new Date(),
    };
    if (seoExisting[0]) {
      await db.update(seoEntries).set(seoValues).where(eq(seoEntries.id, seoExisting[0].id));
    } else {
      await db.insert(seoEntries).values(seoValues);
    }
  }

  const [{ value: projectCount }] = await db.select({ value: count() }).from(projects);
  if (projectCount < 8) {
    throw new Error(`Seed integrity failed: expected >= 8 projects, found ${projectCount}`);
  }

  console.log(`Upserted portfolio content. Projects in DB: ${projectCount}`);
  console.log("Seed mode: upsert (safe/repeatable). No GitHub token used.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
