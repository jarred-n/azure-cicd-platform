export async function GET() {
  return Response.json({
    status: "healthy",
    env: process.env.NEXT_PUBLIC_ENV ?? "local",
    version: process.env.NEXT_PUBLIC_VERSION ?? "dev",
    timestamp: new Date().toISOString(),
  });
  //   return new Response("broken", { status: 500 });
}
