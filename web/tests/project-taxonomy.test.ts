import { describe, expect, it } from "vitest";
import {
  buildProjectsFilterHref,
  canonicalizeTypeSlug,
  filterProjects,
  projectMatchesGroup,
  projectMatchesType,
  unassignedProjects,
  workContextFromGroupSlug,
} from "@/lib/project-taxonomy";

const sample = [
  {
    slug: "a",
    category: "web-development",
    workContext: "client",
    typeSlugs: ["web-development"],
  },
  {
    slug: "b",
    category: "mobile-app-development",
    workContext: "personal",
    typeSlugs: ["mobile-app-development", "full-stack-development"],
  },
  {
    slug: "c",
    category: "ai-projects",
    workContext: "unassigned",
    typeSlugs: ["ai-projects"],
    needsGroupReview: 1,
  },
];

describe("project taxonomy filters", () => {
  it("maps short type aliases to canonical slugs", () => {
    expect(canonicalizeTypeSlug("web")).toBe("web-development");
    expect(canonicalizeTypeSlug("mobile")).toBe("mobile-app-development");
    expect(canonicalizeTypeSlug("full-stack")).toBe("full-stack-development");
    expect(canonicalizeTypeSlug("ai")).toBe("ai-projects");
    expect(canonicalizeTypeSlug("custom-shopify")).toBe("custom-shopify");
  });

  it("maps group URL slugs", () => {
    expect(workContextFromGroupSlug("client-company")).toBe("client");
    expect(workContextFromGroupSlug("freelance-personal")).toBe("personal");
  });

  it("keeps unassigned projects in All Projects", () => {
    expect(unassignedProjects(sample).map((p) => p.slug)).toEqual(["c"]);
    expect(filterProjects(sample, {}).map((p) => p.slug)).toEqual(["a", "b", "c"]);
  });

  it("filters by main group without inventing ownership", () => {
    expect(filterProjects(sample, { group: "client-company" }).map((p) => p.slug)).toEqual(["a"]);
    expect(filterProjects(sample, { group: "freelance-personal" }).map((p) => p.slug)).toEqual(["b"]);
    expect(projectMatchesGroup(sample[2], "client-company")).toBe(false);
  });

  it("filters by subcategory and combined URL params", () => {
    expect(projectMatchesType(sample[1], "mobile")).toBe(true);
    expect(projectMatchesType(sample[1], "full-stack")).toBe(true);
    expect(filterProjects(sample, { type: "web" }).map((p) => p.slug)).toEqual(["a"]);
    expect(
      filterProjects(sample, { group: "freelance-personal", type: "mobile" }).map((p) => p.slug),
    ).toEqual(["b"]);
    expect(filterProjects(sample, { group: "client-company", type: "ai" })).toEqual([]);
  });

  it("builds shareable filter hrefs", () => {
    expect(buildProjectsFilterHref({})).toBe("/projects");
    expect(buildProjectsFilterHref({ type: "web" })).toBe("/projects?type=web-development");
    expect(buildProjectsFilterHref({ group: "client-company", type: "mobile" })).toBe(
      "/projects?group=client-company&type=mobile-app-development",
    );
  });
});
