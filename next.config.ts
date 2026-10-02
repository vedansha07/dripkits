import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components: product data is cached with `'use cache'` + cacheLife, anything
  // request-bound (cart, session) streams inside <Suspense>. See context/dripkits-plan.md.
  cacheComponents: true,
  images: {
    // Dummy imagery until he supplies real photos. Supabase Storage host gets added in Phase 1.
    remotePatterns: [new URL("https://picsum.photos/**")],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
