import { MoonStar, Search, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/store/use-app-store";

interface TopbarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function Topbar({ search, onSearchChange }: TopbarProps) {
  const { locale, t } = useI18n();
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const setLocale = useAppStore((state) => state.setLocale);
  const activeProjectId = useAppStore((state) => state.activeProjectId);
  const setActiveProjectId = useAppStore((state) => state.setActiveProjectId);
  const projects = useAppStore((state) => state.projects);

  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="relative w-full min-w-0 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => onSearchChange(event.target.value)} className="pl-9" placeholder={t("common.search")} />
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[96px_minmax(0,1fr)_44px] lg:w-auto lg:min-w-[430px]">
          <Select value={locale} onValueChange={(value) => setLocale(value as "en" | "ru") }>
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t("common.localeEn")}</SelectItem>
              <SelectItem value="ru">{t("common.localeRu")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={activeProjectId} onValueChange={setActiveProjectId}>
            <SelectTrigger className="w-full min-w-0">
              <SelectValue placeholder={t("common.selectWorkspace")} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="w-full sm:w-11" variant="outline" size="icon" aria-label={t("common.themeToggle")} title={t("common.themeToggle")} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
