import type { Metadata } from "next";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { HeroStage } from "@/components/HeroStage";
import { JourneySection } from "@/components/JourneySection";
import { ServicesShowcase } from "@/components/ServicesShowcase";
import { SkillsShowcase } from "@/components/SkillsShowcase";
import { WorkShowcase } from "@/components/WorkShowcase";
import { getHomeContent, listPublishedProjects, listPublishedServices } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ZainCodes — Web, Full Stack & Mobile Development",
  description:
    "Hire ZainCodes for custom web development, full-stack systems, and Android/Flutter mobile apps. Clear process, real case studies, production focus.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  let content: Awaited<ReturnType<typeof getHomeContent>> = {
    hero: null,
    about: null,
    contact: null,
    settings: null,
    social: [],
    resume: null,
    skills: [],
    experience: [],
    education: [],
    featuredProjects: [],
  } as unknown as Awaited<ReturnType<typeof getHomeContent>>;
  let projects: Awaited<ReturnType<typeof listPublishedProjects>> = [];
  let services: Awaited<ReturnType<typeof listPublishedServices>> = [];
  try {
    content = await getHomeContent();
    projects = await listPublishedProjects();
    services = await listPublishedServices();
  } catch {
    // Keep homepage renderable if local DB is warming or locked.
  }
  const hero = content.hero;
  const about = content.about;
  const featured = projects.slice(0, 5);

  return (
    <main>
      <HeroStage
        badge={hero?.badge}
        badgeEnabled={hero?.badgeEnabled == null ? true : Number(hero.badgeEnabled) !== 0}
        greeting={hero?.greeting}
        description={hero?.description}
        avatarUrl={hero?.avatarUrl}
      />

      <AboutSection
        introTitle={about?.introTitle}
        introText={about?.introText}
        location={about?.location || content.contact?.location}
        experienceSummary={about?.experienceSummary}
        educationSummary={about?.educationSummary}
        company={about?.company}
        years={hero?.statYears}
        productsShipped={hero?.statApps}
        hasResume={Boolean(content.resume)}
      />

      <ServicesShowcase
        services={services.map((s) => ({
          slug: s.slug,
          title: s.title,
          summary: s.summary,
          capabilities: s.capabilities || [],
          href: s.href || null,
          sortOrder: s.sortOrder,
        }))}
      />

      <WorkShowcase projects={featured} />

      <SkillsShowcase categories={content.skills || []} />

      <JourneySection experience={content.experience || []} education={content.education || []} />

      <ContactSection
        email={content.contact?.email}
        phone={content.contact?.phone}
        location={content.contact?.location}
        whatsapp={content.settings?.whatsappE164 || content.contact?.phone}
        social={(content.social || []).map((s) => ({ name: s.name, url: s.url, icon: s.icon }))}
      />
    </main>
  );
}
