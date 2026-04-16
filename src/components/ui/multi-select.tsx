import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
}

export function MultiSelect({ value, onChange, options, placeholder }: MultiSelectProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const emptyPlaceholder = placeholder ?? t("multiSelect.empty");
  const optionMap = useMemo(() => new Map(options.map((option) => [option.value, option])), [options]);
  const filteredOptions = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return options;
    }

    return options.filter((option) => `${option.label} ${option.description ?? ""} ${option.value}`.toLowerCase().includes(search));
  }, [options, query]);

  const toggle = (nextValue: string) => {
    if (value.includes(nextValue)) {
      onChange(value.filter((item) => item !== nextValue));
      return;
    }

    onChange([...value, nextValue]);
  };

  return (
    <Card className="border-border/60 bg-background/40 p-3">
      <div className="mb-3 flex min-h-10 flex-wrap gap-2">
        {value.length > 0 ? value.map((item) => <Badge key={item} variant="secondary" className="max-w-full truncate">{optionMap.get(item)?.label ?? item}</Badge>) : <span className="text-sm text-muted-foreground">{emptyPlaceholder}</span>}
      </div>
      <div className="mb-3 flex gap-2">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("multiSelect.search")} className="h-9" />
        <Button type="button" variant="outline" size="sm" disabled={value.length === 0} onClick={() => onChange([])}>
          {t("multiSelect.clear")}
        </Button>
      </div>
      <ScrollArea className="h-44 rounded-xl border border-border/60 bg-background/50">
        <div className="space-y-1 p-2">
          {filteredOptions.map((option) => {
            const active = value.includes(option.value);

            return (
              <Button
                key={option.value}
                type="button"
                variant="ghost"
                className={cn("h-auto w-full justify-between gap-3 rounded-xl px-3 py-2 text-left", active && "bg-accent")}
                onClick={() => toggle(option.value)}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{option.label}</div>
                  {option.description ? <div className="line-clamp-2 text-xs text-muted-foreground">{option.description}</div> : null}
                </div>
                <div className={cn("flex h-5 w-5 items-center justify-center rounded-md border border-border", active && "border-primary bg-primary text-primary-foreground")}>
                  {active ? <Check className="h-3.5 w-3.5" /> : null}
                </div>
              </Button>
            );
          })}
          {filteredOptions.length === 0 ? <div className="px-2 py-3 text-sm text-muted-foreground">{t("multiSelect.noResults")}</div> : null}
        </div>
      </ScrollArea>
    </Card>
  );
}
