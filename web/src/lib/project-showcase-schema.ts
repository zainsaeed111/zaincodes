import { z } from "zod";

export const showcaseFieldsSchema = {
  videoPosterUrl: z.string().max(1000).nullable().optional(),
  showcaseMode: z.enum(["static", "slideshow", "video", "custom"]).optional(),
  showcaseAutoplay: z.union([z.boolean(), z.number().int().min(0).max(1)]).optional(),
  slideshowIntervalMs: z.number().int().min(1500).max(20000).optional(),
  imageFit: z.enum(["cover", "contain"]).optional(),
  bannerAspect: z.enum(["16/10", "16/9", "2/1", "4/3"]).optional(),
  scrollPreview: z.union([z.boolean(), z.number().int().min(0).max(1)]).optional(),
  showcaseImageOrder: z.array(z.string().max(1000)).optional(),
  isFeatured: z.union([z.boolean(), z.number().int().min(0).max(1)]).optional(),
};

export function toFlag(value: boolean | number | undefined, fallback = 0) {
  if (value === undefined) return fallback;
  return value === true || value === 1 ? 1 : 0;
}
