export function slugify(title: string): string {
  return title
    .trim()
    .replace(/[^\w一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || '-'
}
