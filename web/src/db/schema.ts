import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Server-side session registry for logout invalidation. */
export const authSessions = pgTable(
  "auth_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jti: text("jti").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    userAgent: text("user_agent"),
    ip: text("ip"),
  },
  (table) => [uniqueIndex("auth_sessions_jti_idx").on(table.jti)],
);

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  brandName: text("brand_name").notNull().default("ZainCodes"),
  theme: text("theme").notNull().default("dark"),
  whatsappE164: text("whatsapp_e164"),
  footerBlurb: text("footer_blurb"),
  resumeLink: text("resume_link"),
  logoUrl: text("logo_url"),
  blogMonetizationEnabled: integer("blog_monetization_enabled").notNull().default(0),
  adsenseClientId: text("adsense_client_id"),
  affiliateDisclosure: text("affiliate_disclosure"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const heroContent = pgTable("hero_content", {
  id: serial("id").primaryKey(),
  badge: text("badge"),
  badgeEnabled: integer("badge_enabled").notNull().default(1),
  greeting: text("greeting"),
  title: text("title"),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  statApps: integer("stat_apps").default(0),
  statYears: integer("stat_years").default(0),
  statSatisfaction: integer("stat_satisfaction").default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const aboutContent = pgTable("about_content", {
  id: serial("id").primaryKey(),
  subtitle: text("subtitle"),
  introTitle: text("intro_title"),
  introText: text("intro_text"),
  location: text("location"),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  experienceSummary: text("experience_summary"),
  educationSummary: text("education_summary"),
  techStack: jsonb("tech_stack").$type<Array<{ name: string; icon?: string; color?: string }>>().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const experienceEntries = pgTable("experience_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company"),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  summary: text("summary"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const educationEntries = pgTable("education_entries", {
  id: serial("id").primaryKey(),
  school: text("school").notNull(),
  degree: text("degree"),
  field: text("field"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  summary: text("summary"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const contactContent = pgTable("contact_content", {
  id: serial("id").primaryKey(),
  email: text("email"),
  phone: text("phone"),
  location: text("location"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  platform: text("platform"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const skillCategories = pgTable("skill_categories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => skillCategories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  level: integer("level").notNull().default(80),
  color: text("color"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    body: text("body"),
    capabilities: jsonb("capabilities").$type<string[]>().default([]),
    href: text("href"),
    status: text("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("services_slug_idx").on(table.slug)],
);

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    legacyId: integer("legacy_id"),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    /** client = company/client work; personal = personal & freelance (always fixed). */
    workContext: text("work_context").notNull().default("client"),
    /** Optional glyph id for custom/preset disciplines (web, ios, spark, …). */
    categoryIcon: text("category_icon"),
    description: text("description"),
    longDescription: text("long_description"),
    problem: text("problem"),
    solution: text("solution"),
    architecture: text("architecture"),
    technologies: jsonb("technologies").$type<string[]>().default([]),
    features: jsonb("features").$type<string[]>().default([]),
    highlights: jsonb("highlights").$type<string[]>().default([]),
    coverUrl: text("cover_url"),
    thumbnailUrl: text("thumbnail_url"),
    videoUrl: text("video_url"),
    videoPosterUrl: text("video_poster_url"),
    /** Legacy device frame hint — unused by public banner-first UI. */
    previewStyle: text("preview_style").notNull().default("banner"),
    /** static | slideshow | video | custom */
    showcaseMode: text("showcase_mode").notNull().default("static"),
    showcaseAutoplay: integer("showcase_autoplay").notNull().default(1),
    slideshowIntervalMs: integer("slideshow_interval_ms").notNull().default(4200),
    /** cover | contain */
    imageFit: text("image_fit").notNull().default("cover"),
    /** 16/10 | 16/9 | 2/1 | 4/3 */
    bannerAspect: text("banner_aspect").notNull().default("16/10"),
    /** Tall webpage screenshot scrolls inside fixed banner viewport */
    scrollPreview: integer("scroll_preview").notNull().default(0),
    /** Ordered visible image URLs for slideshow/custom; empty = cover + screenshots */
    showcaseImageOrder: jsonb("showcase_image_order").$type<string[]>().default([]),
    isFeatured: integer("is_featured").notNull().default(0),
    /** 1 = main group (Client/Freelance) needs admin review; still shown in All Projects */
    needsGroupReview: integer("needs_group_review").notNull().default(0),
    playStoreLink: text("play_store_link"),
    liveLink: text("live_link"),
    githubLink: text("github_link"),
    status: text("status").notNull().default("published"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("projects_slug_idx").on(table.slug)],
);

export const projectImages = pgTable("project_images", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  sortOrder: integer("sort_order").notNull().default(0),
  isCover: boolean("is_cover").notNull().default(false),
});

/** Dynamic project subcategories (Web, Mobile, AI, custom…). */
export const projectTypes = pgTable(
  "project_types",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon").default("spark"),
    sortOrder: integer("sort_order").notNull().default(0),
    /** 1 = visible in public filters */
    enabled: integer("enabled").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("project_types_slug_idx").on(table.slug)],
);

/** Many-to-many: project ↔ subcategory. */
export const projectTypeLinks = pgTable(
  "project_type_links",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    typeId: integer("type_id")
      .notNull()
      .references(() => projectTypes.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [uniqueIndex("project_type_links_unique").on(table.projectId, table.typeId)],
);

export const blogCategories = pgTable(
  "blog_categories",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
  },
  (table) => [uniqueIndex("blog_categories_slug_idx").on(table.slug)],
);

export const blogTags = pgTable(
  "blog_tags",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
  },
  (table) => [uniqueIndex("blog_tags_slug_idx").on(table.slug)],
);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    body: text("body"),
    bodyHtml: text("body_html"),
    featuredImageUrl: text("featured_image_url"),
    featuredImageAlt: text("featured_image_alt"),
    categoryId: integer("category_id").references(() => blogCategories.id, { onDelete: "set null" }),
    status: text("status").notNull().default("draft"), // draft | published | scheduled
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    canonicalUrl: text("canonical_url"),
    ogImageUrl: text("og_image_url"),
    authorName: text("author_name").default("Zain Saeed"),
    authorBio: text("author_bio"),
    readingMinutes: integer("reading_minutes").default(1),
    contentVersion: integer("content_version").notNull().default(1),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("blog_posts_slug_idx").on(table.slug)],
);

export const blogPostTags = pgTable(
  "blog_post_tags",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => blogTags.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("blog_post_tags_unique").on(table.postId, table.tagId)],
);

export const blogPostRevisions = pgTable("blog_post_revisions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => blogPosts.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  excerpt: text("excerpt"),
  bodyHtml: text("body_html"),
  meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const blogSlugRedirects = pgTable(
  "blog_slug_redirects",
  {
    id: serial("id").primaryKey(),
    fromSlug: text("from_slug").notNull(),
    toSlug: text("to_slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("blog_slug_redirects_from_idx").on(table.fromSlug)],
);

export const analyticsIntegrations = pgTable(
  "analytics_integrations",
  {
    id: serial("id").primaryKey(),
    provider: text("provider").notNull(), // gsc | ga4
    status: text("status").notNull().default("disconnected"), // disconnected | pending | connected
    propertyId: text("property_id"),
    tokenCipher: text("token_cipher"),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    lastError: text("last_error"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("analytics_integrations_provider_idx").on(table.provider)],
);

export const resumeAssets = pgTable("resume_assets", {
  id: serial("id").primaryKey(),
  storageKey: text("storage_key").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull().default("application/pdf"),
  bytes: integer("bytes").notNull().default(0),
  isCurrent: boolean("is_current").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  storageKey: text("storage_key").notNull().unique(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  bytes: integer("bytes").notNull().default(0),
  kind: text("kind").notNull(), // resume | project | blog | brand
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const seoEntries = pgTable(
  "seo_entries",
  {
    id: serial("id").primaryKey(),
    entityType: text("entity_type").notNull(), // page | project | post | service
    entityKey: text("entity_key").notNull(),
    title: text("title"),
    description: text("description"),
    canonicalUrl: text("canonical_url"),
    ogImageUrl: text("og_image_url"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("seo_entries_entity_idx").on(table.entityType, table.entityKey)],
);

export const schemaMigrations = pgTable("schema_migrations", {
  id: serial("id").primaryKey(),
  version: text("version").notNull().unique(),
  appliedAt: timestamp("applied_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  images: many(projectImages),
  typeLinks: many(projectTypeLinks),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));

export const projectTypesRelations = relations(projectTypes, ({ many }) => ({
  links: many(projectTypeLinks),
}));

export const projectTypeLinksRelations = relations(projectTypeLinks, ({ one }) => ({
  project: one(projects, {
    fields: [projectTypeLinks.projectId],
    references: [projects.id],
  }),
  type: one(projectTypes, {
    fields: [projectTypeLinks.typeId],
    references: [projectTypes.id],
  }),
}));

export const skillCategoriesRelations = relations(skillCategories, ({ many }) => ({
  skills: many(skills),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  category: one(skillCategories, {
    fields: [skills.categoryId],
    references: [skillCategories.id],
  }),
}));
