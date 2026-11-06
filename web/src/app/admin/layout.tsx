import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

/** Minimal CMS shell — public header/footer/WhatsApp are hidden via pathname guards. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-root">{children}</div>;
}
