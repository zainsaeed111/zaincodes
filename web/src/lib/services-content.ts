export type ServicePage = {
  slug: string;
  title: string;
  summary: string;
  intent: string;
  body: string[];
  faqs: Array<{ q: string; a: string }>;
};

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: "web-development",
    title: "Web Development",
    summary: "Custom websites and web applications with maintainable architecture and clear UX.",
    intent: "Teams searching for web development partners who ship production-ready interfaces.",
    body: [
      "ZainCodes designs and builds web products that feel intentional: information hierarchy, performance budgets, and code that a team can extend.",
      "Engagements typically cover marketing sites, dashboards, and customer-facing web apps using modern React ecosystems — with accessibility and SEO as part of delivery, not afterthoughts.",
      "You get a documented component structure, responsive layouts, and a path from design intent to deployable builds.",
    ],
    faqs: [
      {
        q: "Do you rebuild existing sites?",
        a: "Yes — migrations from older stacks are common, with content preservation and staged cutovers.",
      },
      {
        q: "Can you work with our designer?",
        a: "Absolutely. Design systems and Figma handoff are welcome; we also refine UX when needed.",
      },
    ],
  },
  {
    slug: "full-stack-development",
    title: "Full Stack Development",
    summary: "End-to-end systems: APIs, data, auth, and interfaces that operate as one product.",
    intent: "Buyers looking for full stack development spanning backend services and polished clients.",
    body: [
      "Full-stack work at ZainCodes means coherent contracts between UI and API, reliable authentication, and data models that match real workflows.",
      "Typical deliveries include REST services, admin portals, realtime updates where useful, and operational basics like validation, logging, and role-aware access.",
      "The goal is a shippable system — not disconnected frontend and backend demos.",
    ],
    faqs: [
      {
        q: "Which backends do you use?",
        a: "Node/Express or Spring Boot are common; we choose based on your existing stack and team skills.",
      },
      {
        q: "Do you handle deployment?",
        a: "We prepare production builds and can collaborate on Vercel, containers, or your preferred host.",
      },
    ],
  },
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    summary: "Android and Flutter applications from architecture through release readiness.",
    intent: "Organizations seeking mobile app development with store-aware delivery.",
    body: [
      "Mobile products need offline thinking, battery-aware networking, and UI that holds up on real devices — not just emulators.",
      "ZainCodes ships native Android (Kotlin/Java) and cross-platform Flutter apps with clean architecture patterns, API integration, and release hygiene.",
      "Case studies on this site show published and client apps across fintech, education, health, and operations.",
    ],
    faqs: [
      {
        q: "Native or Flutter?",
        a: "We help you choose: native when platform depth matters; Flutter when shared UI velocity is the priority.",
      },
      {
        q: "Do you submit to Play Store?",
        a: "Yes — packaging, signing guidance, and store listing support are part of mobile delivery.",
      },
    ],
  },
  {
    slug: "custom-software-development",
    title: "Custom Software Development",
    summary: "Tailored software shaped around your workflows, integrations, and operational constraints.",
    intent: "Teams seeking custom software development beyond off-the-shelf tools.",
    body: [
      "Custom software at ZainCodes starts from real processes: the data that matters, the roles involved, and the integrations that already exist.",
      "Engagements may include internal tools, workflow systems, admin portals, and productized services — with clear boundaries and maintainable code.",
      "Delivery focuses on usable software, not speculative platforms. Scope stays honest to the problem.",
    ],
    faqs: [
      {
        q: "Do you replace existing tools?",
        a: "Sometimes. More often we integrate with what already works and replace only the painful parts.",
      },
      {
        q: "How do you avoid scope creep?",
        a: "Through staged milestones, explicit non-goals, and working increments reviewers can validate.",
      },
    ],
  },
  {
    slug: "desktop-application-development",
    title: "Desktop Application Development",
    summary: "Desktop clients and companion tools when a browser or phone is not the right surface.",
    intent: "Buyers evaluating desktop application development for specialized workflows.",
    body: [
      "Desktop applications remain the right choice for deep OS integration, offline-first tools, and environments where a mobile or browser UI is awkward.",
      "ZainCodes can support desktop-oriented work as part of a broader product system — especially companion clients, utilities, and operator tools that sit beside web or mobile products.",
      "This offering is positioned carefully: capabilities and architecture advice first; we do not invent unsupported case studies.",
    ],
    faqs: [
      {
        q: "Which desktop stacks do you use?",
        a: "Stack choice depends on the product. We align with your team’s skills and the platform constraints first.",
      },
      {
        q: "Can desktop apps connect to my existing APIs?",
        a: "Yes — desktop clients commonly consume the same authenticated services as web and mobile.",
      },
    ],
  },
  {
    slug: "flutter-development",
    title: "Flutter Development",
    summary: "Cross-platform Flutter apps with careful state management and native-quality UI.",
    intent: "Searchers specifically evaluating Flutter development partners.",
    body: [
      "Flutter work focuses on consistent UI across Android and iOS, predictable state (GetX/Provider patterns as fit), and maintainable module boundaries.",
      "We integrate REST APIs, local persistence, and platform channels when native capabilities are required.",
      "This page exists because Flutter intent is distinct — content here is unique, not a thin keyword duplicate of mobile services.",
    ],
    faqs: [
      {
        q: "Can Flutter cover web too?",
        a: "Selectively. We use Flutter web when it fits; otherwise we recommend a dedicated web stack.",
      },
    ],
  },
  {
    slug: "android-development",
    title: "Android Development",
    summary: "Native Android engineering with Kotlin/Java, Jetpack, and production resilience.",
    intent: "Teams searching specifically for Android development expertise.",
    body: [
      "Native Android remains the right choice for deep platform features, performance-sensitive flows, and long-lived codebases.",
      "ZainCodes builds with MVVM/Clean Architecture, modern Jetpack components, and careful networking — informed by shipped Play Store apps.",
      "Expect pragmatic refactoring of legacy Java modules when needed, not rewrites for sport.",
    ],
    faqs: [
      {
        q: "Kotlin only?",
        a: "Kotlin-first, with Java interop when maintaining existing modules.",
      },
    ],
  },
];

export function getService(slug: string) {
  return SERVICE_PAGES.find((s) => s.slug === slug) || null;
}
