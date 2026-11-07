import { describe, expect, it } from "vitest";
import { normalizeShowcaseMode, resolveShowcaseSlides } from "@/lib/showcase";

describe("resolveShowcaseSlides", () => {
  const shots = [{ url: "/a.png" }, { url: "/b.png" }, { url: "/c.png" }];

  it("static mode returns only the banner", () => {
    expect(
      resolveShowcaseSlides({
        title: "Demo",
        coverUrl: "/banner.png",
        showcaseMode: "static",
        screenshots: shots,
      }),
    ).toEqual(["/banner.png"]);
  });

  it("slideshow puts banner first then remaining shots", () => {
    expect(
      resolveShowcaseSlides({
        title: "Demo",
        coverUrl: "/banner.png",
        showcaseMode: "slideshow",
        screenshots: shots,
      }),
    ).toEqual(["/banner.png", "/a.png", "/b.png", "/c.png"]);
  });

  it("custom uses explicit order and never invents extras", () => {
    expect(
      resolveShowcaseSlides({
        title: "Demo",
        coverUrl: "/banner.png",
        showcaseMode: "custom",
        showcaseImageOrder: ["/c.png", "/banner.png"],
        screenshots: shots,
      }),
    ).toEqual(["/c.png", "/banner.png"]);
  });

  it("video mode prefers poster then cover", () => {
    expect(
      resolveShowcaseSlides({
        title: "Demo",
        coverUrl: "/banner.png",
        videoPosterUrl: "/poster.png",
        showcaseMode: "video",
        screenshots: shots,
      }),
    ).toEqual(["/poster.png"]);
  });

  it("normalizes unknown modes to static", () => {
    expect(normalizeShowcaseMode("phone")).toBe("static");
    expect(normalizeShowcaseMode("slideshow")).toBe("slideshow");
  });
});
