import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { type Platform } from "@/types";

export function PlatformBadge({ platform }: { platform: Platform }) {
  const { t } = useI18n();
  const variant = platform === "both" ? "default" : platform === "opencode" ? "secondary" : "outline";
  const label = platform === "opencode" ? t("platform.opencode") : platform === "claude" ? t("platform.claude") : t("common.both");
  return <Badge className="font-medium" variant={variant}>{label}</Badge>;
}
