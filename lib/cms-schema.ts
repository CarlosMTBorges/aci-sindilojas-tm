import {database} from "@/lib/db";

let initialized:Promise<void>|undefined;

export function ensureDirectorySchema(){
  if(!process.env.DATABASE_URL)return Promise.resolve();
  initialized??=(async()=>{
    const db=database();
    await db.query("ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address text");
    await db.query(`CREATE TABLE IF NOT EXISTS organization_categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      slug text NOT NULL UNIQUE,
      description text,
      status text NOT NULL DEFAULT 'published',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await db.query(`INSERT INTO organization_categories (name,slug)
      SELECT DISTINCT trim(segment), lower(regexp_replace(trim(segment), '[^a-zA-Z0-9]+', '-', 'g'))
      FROM organizations
      WHERE kind='associate' AND segment IS NOT NULL AND trim(segment)<>''
      ON CONFLICT (slug) DO NOTHING`);
  })().catch(error=>{initialized=undefined;throw error});
  return initialized;
}
