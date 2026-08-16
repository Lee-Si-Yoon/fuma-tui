/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["fumadocs-core", "fumadocs-ui", "fumadocs-obsidian"],
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  async redirects() {
    return [
      { source: "/", destination: "/docs/home", permanent: false },
      { source: "/docs", destination: "/docs/home", permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/docs/:path*.md",
        destination: "/llms.mdx/docs/:path*",
      },
    ];
  },
};

export default nextConfig;
