import { getPolarClient } from "@typefolio/core/billing/polar";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const products = url.searchParams.getAll("products");

  if (products.length === 0) {
    return Response.json(
      { error: "Missing products in query params" },
      { status: 400 },
    );
  }

  const polar = getPolarClient();
  if (!polar) {
    return new Response(null, { status: 503 });
  }

  try {
    const result = await polar.checkouts.create({ products });
    if (!result.url) {
      return new Response(null, { status: 500 });
    }
    return Response.redirect(result.url, 302);
  } catch (error) {
    console.error("[polar] checkout create failed", error);
    return new Response(null, { status: 500 });
  }
}
