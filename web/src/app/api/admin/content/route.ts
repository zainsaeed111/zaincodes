import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/db/client";
import {
  aboutContent,
  contactContent,
  educationEntries,
  experienceEntries,
  heroContent,
  siteSettings,
  skillCategories,
  skills,
  socialLinks,
} from "@/db/schema";
import { getHomeContent } from "@/lib/content";
import { guardAdminRead, guardAdminWrite } from "@/lib/admin-guard";
import { apiOk, handleRouteError, fromZodError } from "@/lib/http";

const patchSchema = z.object({
  settings: z
    .object({
      brandName: z.string().min(1).max(120).optional(),
      theme: z.enum(["light", "dark"]).optional(),
      whatsappE164: z.string().max(32).nullable().optional(),
      footerBlurb: z.string().max(1000).nullable().optional(),
      resumeLink: z.string().max(500).nullable().optional(),
      logoUrl: z.string().max(500).nullable().optional(),
    })
    .optional(),
  hero: z
    .object({
      badge: z.string().max(200).nullable().optional(),
      badgeEnabled: z.union([z.boolean(), z.number().int().min(0).max(1)]).optional(),
      greeting: z.string().max(200).nullable().optional(),
      title: z.string().max(300).nullable().optional(),
      description: z.string().max(2000).nullable().optional(),
      avatarUrl: z.string().max(500).nullable().optional(),
      statApps: z.number().int().min(0).max(100000).optional(),
      statYears: z.number().int().min(0).max(100).optional(),
      statSatisfaction: z.number().int().min(0).max(100).optional(),
    })
    .optional(),
  about: z
    .object({
      subtitle: z.string().max(500).nullable().optional(),
      introTitle: z.string().max(300).nullable().optional(),
      introText: z.string().max(5000).nullable().optional(),
      location: z.string().max(200).nullable().optional(),
      email: z.string().max(200).nullable().optional(),
      phone: z.string().max(64).nullable().optional(),
      company: z.string().max(200).nullable().optional(),
      experienceSummary: z.string().max(1000).nullable().optional(),
      educationSummary: z.string().max(1000).nullable().optional(),
      techStack: z
        .array(z.object({ name: z.string(), icon: z.string().optional(), color: z.string().optional() }))
        .optional(),
    })
    .optional(),
  contact: z
    .object({
      email: z.string().max(200).nullable().optional(),
      phone: z.string().max(64).nullable().optional(),
      location: z.string().max(200).nullable().optional(),
    })
    .optional(),
  social: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string().min(1).max(80),
        icon: z.string().max(40).nullable().optional(),
        url: z.string().url().max(500),
        sortOrder: z.number().int().optional(),
      }),
    )
    .optional(),
  experience: z
    .array(
      z.object({
        id: z.number().optional(),
        title: z.string().min(1).max(200),
        company: z.string().max(200).nullable().optional(),
        location: z.string().max(200).nullable().optional(),
        startDate: z.string().max(64).nullable().optional(),
        endDate: z.string().max(64).nullable().optional(),
        summary: z.string().max(2000).nullable().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .optional(),
  education: z
    .array(
      z.object({
        id: z.number().optional(),
        school: z.string().min(1).max(200),
        degree: z.string().max(200).nullable().optional(),
        field: z.string().max(200).nullable().optional(),
        startDate: z.string().max(64).nullable().optional(),
        endDate: z.string().max(64).nullable().optional(),
        summary: z.string().max(2000).nullable().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .optional(),
  skillCategories: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        icon: z.string().max(40).nullable().optional(),
        sortOrder: z.number().int().optional(),
        skills: z
          .array(
            z.object({
              name: z.string().min(1).max(120),
              level: z.number().int().min(0).max(100).optional(),
              color: z.string().max(40).nullable().optional(),
              sortOrder: z.number().int().optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await guardAdminRead(req);
    if (error) return error;
    const content = await getHomeContent();
    return apiOk({ content });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { error } = await guardAdminWrite(req);
    if (error) return error;

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return fromZodError(parsed.error);

    await ensureSchema();
    const db = getDb();
    const body = parsed.data;

    if (body.settings) {
      const [row] = await db.select().from(siteSettings).limit(1);
      if (row) await db.update(siteSettings).set({ ...body.settings, updatedAt: new Date() }).where(eq(siteSettings.id, row.id));
      else await db.insert(siteSettings).values({ brandName: "ZainCodes", ...body.settings });
    }

    if (body.hero) {
      const heroPayload = {
        ...body.hero,
        badgeEnabled:
          body.hero.badgeEnabled === undefined
            ? undefined
            : body.hero.badgeEnabled === true || body.hero.badgeEnabled === 1
              ? 1
              : 0,
        updatedAt: new Date(),
      };
      const [row] = await db.select().from(heroContent).limit(1);
      if (row) await db.update(heroContent).set(heroPayload).where(eq(heroContent.id, row.id));
      else await db.insert(heroContent).values(heroPayload);
    }

    if (body.about) {
      const [row] = await db.select().from(aboutContent).limit(1);
      if (row) await db.update(aboutContent).set({ ...body.about, updatedAt: new Date() }).where(eq(aboutContent.id, row.id));
      else await db.insert(aboutContent).values(body.about);
    }

    if (body.contact) {
      const [row] = await db.select().from(contactContent).limit(1);
      if (row) await db.update(contactContent).set({ ...body.contact, updatedAt: new Date() }).where(eq(contactContent.id, row.id));
      else await db.insert(contactContent).values(body.contact);
    }

    if (body.social) {
      await db.delete(socialLinks);
      if (body.social.length) {
        await db.insert(socialLinks).values(
          body.social.map((s, idx) => ({
            name: s.name,
            icon: s.icon || null,
            url: s.url,
            sortOrder: s.sortOrder ?? idx,
          })),
        );
      }
    }

    if (body.experience) {
      await db.delete(experienceEntries);
      if (body.experience.length) {
        await db.insert(experienceEntries).values(
          body.experience.map((e, idx) => ({
            title: e.title,
            company: e.company || null,
            location: e.location || null,
            startDate: e.startDate || null,
            endDate: e.endDate || null,
            summary: e.summary || null,
            sortOrder: e.sortOrder ?? idx,
          })),
        );
      }
    }

    if (body.education) {
      await db.delete(educationEntries);
      if (body.education.length) {
        await db.insert(educationEntries).values(
          body.education.map((e, idx) => ({
            school: e.school,
            degree: e.degree || null,
            field: e.field || null,
            startDate: e.startDate || null,
            endDate: e.endDate || null,
            summary: e.summary || null,
            sortOrder: e.sortOrder ?? idx,
          })),
        );
      }
    }

    if (body.skillCategories) {
      await db.delete(skills);
      await db.delete(skillCategories);
      for (const [idx, cat] of body.skillCategories.entries()) {
        const [inserted] = await db
          .insert(skillCategories)
          .values({
            title: cat.title,
            icon: cat.icon || null,
            sortOrder: cat.sortOrder ?? idx,
          })
          .returning();
        const skillList = cat.skills || [];
        if (skillList.length) {
          await db.insert(skills).values(
            skillList.map((s, sIdx) => ({
              categoryId: inserted.id,
              name: s.name,
              level: s.level ?? 80,
              color: s.color || null,
              sortOrder: s.sortOrder ?? sIdx,
            })),
          );
        }
      }
    }

    const content = await getHomeContent();
    return apiOk({ content, saved: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
