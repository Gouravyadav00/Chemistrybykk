import { thumbUrl, VIDEOS, watchUrl } from "@/data/videos";

// Google video sitemap (sitemap-video/1.1). Next 14's MetadataRoute.Sitemap
// has no `videos` field yet, so the XML is emitted by hand here.
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://chemistrybykk.vercel.app"
).replace(/\/$/, "");

export const dynamic = "force-static";

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function GET() {
  const videos = VIDEOS.map(
    (v) => `    <video:video>
      <video:thumbnail_loc>${thumbUrl(v.id)}</video:thumbnail_loc>
      <video:title>${escapeXml(v.title)}</video:title>
      <video:description>${escapeXml(v.description)}</video:description>
      <video:player_loc>https://www.youtube-nocookie.com/embed/${v.id}</video:player_loc>
      <video:publication_date>${v.uploadDate}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
      <video:uploader info="https://www.youtube.com/@chemistrybykk">Khyati Kaushik</video:uploader>
      <video:content_loc>${escapeXml(watchUrl(v))}</video:content_loc>
    </video:video>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${siteUrl}/</loc>
${videos}
  </url>
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
