import { load } from 'https://deno.land/std/dotenv/mod.ts'
await load({export: true})

export const { ANTHROPIC_API_KEY } = Deno.env.toObject();
export const ANTHROPIC_VERSION = '2023-06-01';
export const model = "claude-3-5-sonnet-20241022";
