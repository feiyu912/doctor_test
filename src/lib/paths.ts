export const basePath = import.meta.env.BASE_URL;

export function withBase(path: string): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${basePath}${cleanPath}`.replace(/\/{2,}/g, "/");
}

export function canonicalPath(path: string): string {
  return new URL(withBase(path), import.meta.env.SITE).toString();
}
