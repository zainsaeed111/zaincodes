import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Neon HTTP driver — no cloudflare:sockets / postgres workerd entry.
export default defineCloudflareConfig();
