import { useState } from "react";
import { GripVertical, Link2, Move } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { type Subagent } from "@/types";

interface HierarchyTreeProps {
  subagents: Subagent[];
  onMove: (subagentId: string, parentId: string | null) => void;
}

export function HierarchyTree({ subagents, onMove }: HierarchyTreeProps) {
  const { t } = useI18n();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const visibleIds = new Set(subagents.map((subagent) => subagent.id));
  const roots = subagents.filter((subagent) => !subagent.parentId || !visibleIds.has(subagent.parentId));
  const orphanedNodes = subagents.filter((subagent) => subagent.parentId && !visibleIds.has(subagent.parentId));

  const childrenFor = (id: string) => subagents.filter((subagent) => subagent.parentId === id);

  const isDescendant = (nodeId: string, targetId: string): boolean => {
    const directChildren = childrenFor(nodeId);
    return directChildren.some((child) => child.id === targetId || isDescendant(child.id, targetId));
  };

  const renderNode = (node: Subagent, depth = 0) => {
    const children = childrenFor(node.id);

    return (
      <div key={node.id} className="space-y-3">
        <Card className="bg-background/40">
          <CardHeader
            draggable
            onDragStart={() => setDraggingId(node.id)}
            onDragEnd={() => setDraggingId(null)}
            onDragOver={(event) => {
              if (!draggingId || draggingId === node.id || isDescendant(draggingId, node.id)) return;
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (!draggingId || draggingId === node.id || isDescendant(draggingId, node.id)) return;
              onMove(draggingId, node.id);
              setDraggingId(null);
            }}
            className="flex cursor-grab flex-row items-center justify-between gap-3 space-y-0 pb-3 active:cursor-grabbing"
          >
            <div className="flex items-center gap-3" style={{ paddingLeft: depth * 16 }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/70">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">@{node.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{node.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Move className="mr-1 h-3 w-3" />
                {t("hierarchy.drag")}
              </Badge>
              <Badge variant="outline">{node.contextBehavior === "share" ? t("hierarchy.shared") : t("hierarchy.isolated")}</Badge>
              <Button type="button" variant="outline" size="sm" onClick={() => onMove(node.id, null)}>
                <Link2 className="mr-2 h-4 w-4" />
                {t("hierarchy.makeRoot")}
              </Button>
            </div>
          </CardHeader>
          {children.length > 0 ? <CardContent className="space-y-3 pt-0">{children.map((child) => renderNode(child, depth + 1))}</CardContent> : null}
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {orphanedNodes.length > 0 ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-muted-foreground">
          {t("hierarchy.orphans")}
        </div>
      ) : null}
      {roots.map((root) => renderNode(root))}
    </div>
  );
}
