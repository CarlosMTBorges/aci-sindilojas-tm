export const runtime = "edge";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const objectKey = key.join("/");
  if (process.env.VERCEL) return new Response("Não encontrado", { status: 404 });
  const { env } = await import("cloudflare:workers");
  if (!objectKey.startsWith("aci/") || !env.BUCKET) return new Response("Não encontrado", { status: 404 });
  const object = await env.BUCKET.get(objectKey);
  if (!object) return new Response("Não encontrado", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
