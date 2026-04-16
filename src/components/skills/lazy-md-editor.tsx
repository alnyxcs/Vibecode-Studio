import { Suspense, lazy } from "react";
import { useI18n } from "@/lib/i18n";

const MDEditor = lazy(() => import("@uiw/react-md-editor"));

interface LazyMdEditorProps {
  value?: string;
  onChange?: (value?: string) => void;
  height?: number;
}

export function LazyMdEditor({ value, onChange, height = 320 }: LazyMdEditorProps) {
  const { t } = useI18n();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center bg-card/30 px-4 text-sm text-muted-foreground">
          {t("common.loadingEditor")}
        </div>
      }
    >
      <MDEditor value={value} onChange={onChange} preview="edit" height={height} visibleDragbar={false} />
    </Suspense>
  );
}
