import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { projectGradients } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import { type Project } from "@/types";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(4),
  color: z.string().min(1),
});

type ProjectForm = z.infer<typeof schema>;

interface ProjectsPageProps {
  projects: Project[];
}

export function ProjectsPage({ projects }: ProjectsPageProps) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [confirmProject, setConfirmProject] = useState<Project | null>(null);
  const upsertProject = useAppStore((state) => state.upsertProject);
  const deleteProject = useAppStore((state) => state.deleteProject);

  const form = useForm<ProjectForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      color: projectGradients[0],
    },
  });

  const openCreateDialog = () => {
    setEditingProject(null);
    form.reset({ name: "", description: "", color: projectGradients[0] });
    setOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    form.reset({ name: project.name, description: project.description, color: project.color });
    setOpen(true);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow={t("projects.eyebrow")}
        title={t("projects.title")}
        description={t("projects.description")}
        action={{ label: t("projects.new"), onClick: openCreateDialog }}
      />

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden bg-background/40">
            <div className={`h-2 w-full bg-gradient-to-r ${project.color}`} />
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="mt-2">{project.description}</CardDescription>
                </div>
                <Badge variant="outline">{formatDate(project.createdAt, locale)}</Badge>
              </div>
            </CardHeader>
              <CardContent className="flex justify-end gap-2">
               <Button variant="outline" onClick={() => openEditDialog(project)}>
                 {t("common.edit")}
               </Button>
               <Button variant="outline" onClick={() => setConfirmProject(project)} disabled={projects.length === 1}>
                  {t("common.delete")}
                </Button>
              </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingProject ? t("projects.editTitle") : t("projects.createTitle")}</DialogTitle>
            <DialogDescription>{editingProject ? t("projects.editDesc") : t("projects.createDesc")}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => {
                upsertProject(editingProject ? { ...values, id: editingProject.id } : values);
                setOpen(false);
                setEditingProject(null);
                form.reset({ name: "", description: "", color: projectGradients[0] });
              })}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("projects.placeholderName")} {...field} />
                    </FormControl>
                    <FormMessage name="name" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.description")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("projects.placeholderDesc")} {...field} />
                    </FormControl>
                    <FormMessage name="description" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("projects.accent")}</FormLabel>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {projectGradients.map((gradient) => (
                        <button
                          key={gradient}
                          type="button"
                          className={`h-12 rounded-2xl border ${field.value === gradient ? "border-primary" : "border-border/60"} bg-gradient-to-r ${gradient}`}
                          onClick={() => field.onChange(gradient)}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit">{editingProject ? t("projects.save") : t("common.create")}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmProject)}
        onOpenChange={(next) => !next && setConfirmProject(null)}
        title={t("confirm.deleteProjectTitle")}
        description={confirmProject ? t("confirm.deleteProjectDesc").replace("{name}", confirmProject.name) : ""}
        onConfirm={() => {
          if (confirmProject) {
            deleteProject(confirmProject.id);
          }
        }}
      />
    </div>
  );
}
