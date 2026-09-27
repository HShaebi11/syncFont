"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/next-shim";
import { useRouter, useSearchParams } from "@/next-shim";
import { PlusIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

import { addCollectionItem, createCollection, toggleFamilyFavorite, uploadFonts } from "@typefolio/core/api";
import type { FontFamilyGroup } from "@typefolio/core/types";

import { FontGrid } from "@/components/fonts/font-grid";
import { FontLibraryToolbar } from "@/components/fonts/font-library-toolbar";
import { useLibrary } from "@/components/library/library-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, ErrorState, SkeletonBlock } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EMPTY_FILTERS,
  PREVIEW_PRESETS,
  applyFontLibraryQuery,
  familySlug,
  fontLibraryFilterParams,
  fontsHref,
  groupFamilies,
  isFontGroupBy,
  isFontSort,
  isFontView,
  readFontLibraryFilters,
  type FontGroupBy,
  type FontLibraryFilters,
  type FontSort,
  type FontView,
} from "@/lib/font-library";
import { formatCount } from "@/lib/format";

const PREVIEW_STORAGE_KEY = "tf:font-preview";
const DEFAULT_PREVIEW: string = PREVIEW_PRESETS[0].text;
const DEFAULT_SIZE = 40;

async function ingestFonts(files: File[]) {
  if (typeof window !== "undefined" && window.typefolioDesktop) {
    void files;
    const result = await window.typefolioDesktop.pickAndUploadFonts();
    if (result.rejected.length) {
      toast.error(result.rejected.join(", "));
    }
    return { added: result.added, rejected: result.rejected, library: null as never };
  }
  const accepted = files.filter((file) => /\.(otf|ttf|woff2?)$/i.test(file.name));
  if (accepted.length === 0) {
    toast.error("Drop OTF, TTF, WOFF or WOFF2 files.");
    return null;
  }
  return uploadFonts(accepted);
}

export function FontLibrary() {
  const router = useRouter();
  const params = useSearchParams();
  const { status, error, refresh, families, library, collections } = useLibrary();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [selected, setSelected] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewText, setPreviewText] = useState<string>(DEFAULT_PREVIEW);
  const [previewSize, setPreviewSize] = useState(DEFAULT_SIZE);

  const filters = useMemo(() => ({ ...readFontLibraryFilters(params), q: query }), [params, query]);
  const sort: FontSort = isFontSort(params.get("sort") ?? "") ? (params.get("sort") as FontSort) : "newest";
  const view: FontView = isFontView(params.get("view") ?? "") ? (params.get("view") as FontView) : "grid";
  const groupBy: FontGroupBy = isFontGroupBy(params.get("group") ?? "classification")
    ? ((params.get("group") ?? "classification") as FontGroupBy)
    : "classification";
  const focusedGroup = params.get("focus");

  const filtered = useMemo(
    () => applyFontLibraryQuery(families, filters, sort),
    [families, filters, sort],
  );
  const groups = useMemo(
    () =>
      groupFamilies(filtered, groupBy, {
        keepEmptyStyles: groupBy === "classification",
      }),
    [filtered, groupBy],
  );
  const focused = groups.find((group) => group.key === focusedGroup) ?? null;
  const feedGroups = useMemo(
    () =>
      focused
        ? [focused]
        : groups.filter((group) => group.families.length > 0 || groupBy === "none"),
    [focused, groups, groupBy],
  );
  const visibleSlugs = useMemo(
    () => (focused ? focused.families : filtered).map(familySlug),
    [filtered, focused],
  );
  const visibleCount = visibleSlugs.length;
  const allVisibleSelected =
    visibleSlugs.length > 0 && visibleSlugs.every((slug) => selected.includes(slug));
  const pageTitle = focused?.label ?? "Fonts";
  const pageMeta =
    families.length === filtered.length
      ? formatCount(visibleCount, "typeface")
      : `${visibleCount} of ${formatCount(families.length, "typeface")}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREVIEW_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as { text?: string; size?: number };
      if (typeof parsed.text === "string") setPreviewText(parsed.text);
      if (typeof parsed.size === "number") setPreviewSize(parsed.size);
    } catch {
      // ignore bad local preview state
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      PREVIEW_STORAGE_KEY,
      JSON.stringify({ text: previewText, size: previewSize }),
    );
  }, [previewText, previewSize]);

  const paramQuery = params.get("q") ?? "";
  useEffect(() => {
    setQuery(paramQuery);
  }, [paramQuery]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      writeParams({ q: query.trim() || null });
    }, 250);
    return () => window.clearTimeout(timeout);
    // writeParams is stable enough via params snapshot; we only want query debounce
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected([]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hrefFor = (patch: Record<string, string | null>) => fontsHref(params, patch);

  const writeParams = (patch: Record<string, string | null>) => {
    const live = typeof window === "undefined" ? params : new URLSearchParams(window.location.search);
    const href = fontsHref(live, patch);
    const current = live.toString();
    const qs = href === "/fonts" ? "" : href.slice("/fonts?".length);
    if (qs === current) return;
    router.replace(href, { scroll: false });
  };

  const setFilters = (patch: Partial<FontLibraryFilters>) => {
    const next = { ...filters, ...patch };
    if (patch.q !== undefined) setQuery(patch.q);
    writeParams(fontLibraryFilterParams(next));
  };

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    try {
      const result = await ingestFonts(files);
      if (!result) return;
      toast(
        result.rejected.length
          ? `${result.added} uploaded, ${result.rejected.length} rejected`
          : `${result.added} uploaded`,
      );
      await refresh();
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const toggleSelected = (slug: string, additive: boolean) => {
    setSelected((current) => {
      if (!additive) return current.includes(slug) ? [] : [slug];
      return current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
    });
  };

  if (status === "loading") {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-72" />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return <ErrorState body={error ?? "We couldn't load your fonts."} onRetry={() => void refresh()} />;
  }

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        if (event.dataTransfer.types.includes("Files")) setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return;
        setDragging(false);
      }}
      onDrop={async (event) => {
        event.preventDefault();
        setDragging(false);
        await handleUpload(Array.from(event.dataTransfer.files));
      }}
    >
      <div className="sticky top-14 z-20 -mx-4 mb-6 bg-background px-4 pt-2 lg:-mx-8 lg:px-8">
        <header className="mb-5 flex items-end justify-between gap-4">
          <div className="space-y-1">
            {focused ? (
              <Link
                href={hrefFor({ focus: null })}
                scroll={false}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                All fonts
              </Link>
            ) : null}
            <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
          </div>
          <label>
            <input
              type="file"
              accept=".otf,.ttf,.woff,.woff2"
              multiple
              hidden
              disabled={uploading}
              onChange={async (event) => {
                await handleUpload(Array.from(event.target.files ?? []));
                event.target.value = "";
              }}
            />
            <Button asChild disabled={uploading}>
              <span>
                <PlusIcon />
                {uploading ? "Uploading..." : "Add font"}
              </span>
            </Button>
          </label>
        </header>

        <FontLibraryToolbar
          query={query}
          onQueryChange={setQuery}
          filters={filters}
          onFiltersChange={setFilters}
          previewText={previewText}
          onPreviewTextChange={setPreviewText}
          previewSize={previewSize}
          onPreviewSizeChange={setPreviewSize}
          sort={sort}
          onSortChange={(value) => writeParams({ sort: value === "newest" ? null : value })}
          view={view}
          onViewChange={(value) => writeParams({ view: value === "grid" ? null : value })}
          resultLabel={pageMeta}
        />
      </div>

      <div className="min-w-0 space-y-6">
          {selected.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card px-3 py-2">
              <Label className="font-normal">
                <Checkbox
                  checked={allVisibleSelected}
                  disabled={visibleCount === 0}
                  onCheckedChange={() => {
                    setSelected((current) => (allVisibleSelected ? [] : visibleSlugs));
                  }}
                />
                {formatCount(selected.length, "selected")}
              </Label>
              <Button variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
                Add to collection
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selected.length < 2) {
                    toast("Select at least two typefaces to compare.");
                    return;
                  }
                  router.push(`/compare?ids=${selected.slice(0, 4).join(",")}`);
                }}
              >
                Compare {Math.min(selected.length, 4)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (!library) return;
                  const targets = selected
                    .map((slug) => families.find((family) => familySlug(family) === slug))
                    .filter((family): family is FontFamilyGroup => Boolean(family?.slug && !family.favoritedAt));
                  for (const family of targets) {
                    await toggleFamilyFavorite(library.id, family.slug!);
                  }
                  toast(targets.length ? `Saved ${targets.length}` : "Already saved");
                  await refresh();
                }}
              >
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                Clear
              </Button>
            </div>
          ) : null}

          {filtered.length === 0 ? (
            families.length === 0 ? (
              <EmptyState
                title="No fonts yet"
                body="Drop OTF, TTF, WOFF or WOFF2 files here, or add your first typeface."
                action={{
                  label: "Add font",
                  onClick: () => document.querySelector<HTMLInputElement>('input[type="file"]')?.click(),
                }}
              />
            ) : (
              <EmptyState
                title="No matches"
                body="Nothing in the library fits these filters."
                action={{ label: "Clear filters", onClick: () => setFilters(EMPTY_FILTERS) }}
              />
            )
          ) : focused && focused.families.length === 0 ? (
            <EmptyState
              title={`No ${focused.label.toLowerCase()} fonts`}
              body="Nothing in this group yet."
              action={{ label: "Show all fonts", onClick: () => router.replace(hrefFor({ focus: null })) }}
            />
          ) : (
            <FontGrid
              families={focused ? focused.families : feedGroups.flatMap((group) => group.families)}
              selected={selected}
              onSelect={toggleSelected}
              columns={view === "compact" ? 3 : 2}
            />
          )}
      </div>

      {dragging ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-10 py-8">
            <UploadIcon className="size-6" />
            <p className="text-sm font-medium">Drop fonts to add them</p>
            <p className="text-xs text-muted-foreground">OTF, TTF, WOFF, WOFF2</p>
          </div>
        </div>
      ) : null}

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to collection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {collections.length === 0 ? (
              <p className="text-sm text-muted-foreground">Create a collection first.</p>
            ) : (
              collections.map((collection) => (
                <Button
                  key={collection.id}
                  variant="outline"
                  className="justify-start"
                  onClick={async () => {
                    if (!library) return;
                    const selectedFamilies = selected
                      .map((slug) => families.find((family) => familySlug(family) === slug))
                      .filter((family): family is FontFamilyGroup => Boolean(family?.id));
                    for (const family of selectedFamilies) {
                      await addCollectionItem(library.id, collection.slug, {
                        itemType: "family",
                        itemId: family.id,
                      });
                    }
                    toast(`Added to ${collection.name}`);
                    setPickerOpen(false);
                    await refresh();
                  }}
                >
                  {collection.name}
                </Button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(true)}>
              New collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New collection</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            placeholder="Editorial"
            onChange={(event) => setNewName(event.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!library || !newName.trim()) return;
                await createCollection(library.id, { name: newName });
                toast("Collection created");
                setCreateOpen(false);
                setNewName("");
                await refresh();
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
