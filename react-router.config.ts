import type { Config } from "@react-router/dev/config";
import { tumYollar } from "./app/lib/rotalar.ts";

export default {
  appDirectory: "app",
  // Plesk/LiteSpeed paylaşımlı barındırma: Node sunucusu yok, tüm yollar derlemede statik HTML'e çevrilir.
  ssr: false,
  prerender: tumYollar(),
  future: {
    v8_middleware: true,
    v8_passThroughRequests: true,
    v8_splitRouteModules: true,
    v8_trailingSlashAwareDataRequests: true,
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
