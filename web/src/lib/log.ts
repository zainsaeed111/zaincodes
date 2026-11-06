type Level = "info" | "warn" | "error";

function write(level: Level, scope: string, message: string, meta?: Record<string, unknown>) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    scope,
    message,
    ...(meta || {}),
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const log = {
  info: (scope: string, message: string, meta?: Record<string, unknown>) => write("info", scope, message, meta),
  warn: (scope: string, message: string, meta?: Record<string, unknown>) => write("warn", scope, message, meta),
  error: (scope: string, message: string, meta?: Record<string, unknown>) => write("error", scope, message, meta),
};
