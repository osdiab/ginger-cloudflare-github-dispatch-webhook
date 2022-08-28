/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  GINGERHRBOT_REPO_TOKEN?: string;
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== "POST") {
    return new Response("Bad Method", { status: 422 });
  }
  if (!env.GINGERHRBOT_REPO_TOKEN) {
    throw new Error("Missing token, aborting");
  }
  await fetch("https://api.github.com/repos/osdiab/ginger/dispatches", {
    method: "POST",
    headers: {
      Accept: "Accept: application/vnd.github+json",
      Authorization: `token ${env.GINGERHRBOT_REPO_TOKEN}`,
    },
    body: JSON.stringify({
      // from .github/workflows/sync-cloudflare-secrets
      event_type: "sync-cloudflare-pages-secrets",
      // TODO: work for all environments
      client_payload: { env: "canary" },
    }),
  });
  return new Response(`OK`);
};
