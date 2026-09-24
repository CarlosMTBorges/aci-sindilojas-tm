import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";

export const runtime = "edge";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
    if (file.size > 10_000_000) return NextResponse.json({ error: "O arquivo deve ter até 10 MB." }, { status: 413 });
    if (!file.type.startsWith("image/") && !["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
      return NextResponse.json({ error: "Formato de arquivo não permitido." }, { status: 415 });
    }

    if (process.env.VERCEL) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "O armazenamento de arquivos do Vercel não está conectado." }, { status: 503 });
      const { put } = await import("@vercel/blob");
      const blob = await put(`aci/${Date.now()}-${file.name}`, file, { access: "public", addRandomSuffix: true });
      return NextResponse.json({ url: blob.url });
    }

    const { env } = await import("cloudflare:workers");
    if (!env.BUCKET) return NextResponse.json({ error: "Armazenamento de arquivos indisponível. Tente novamente em instantes." }, { status: 503 });
    const key = `aci/${crypto.randomUUID()}-${file.name.replace(/[^\p{L}\p{N}._-]/gu, "-").slice(-100)}`;
    await env.BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
    return NextResponse.json({ url: `/api/media/${key}` });
  } catch (error) {
    console.error("Upload de arquivo falhou", error);
    return NextResponse.json({ error: "Não foi possível enviar o arquivo. Confira o tamanho e tente novamente." }, { status: 500 });
  }
}
