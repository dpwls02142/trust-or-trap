import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 시나리오 그래프 JSON을 서버 번들에 포함시키기 위한 별도 설정은 불필요.
  // (graph-loader가 정적 import로 로드하므로 자동 번들링된다)
  reactStrictMode: true,
};

export default nextConfig;
