"use client";

import {
  Grid3x3Icon,
  LayoutGridIcon,
  ListIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react";

import { FontFilterPanel } from "@/components/fonts/font-filter-panel";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  CLASSIFICATION_LABELS,
  CLASSIFICATIONS,
  EMPTY_FILTERS,
  PREVIEW_PRESETS,
  countActiveFilters,
  type FontLibraryFilters,
  type FontSort,
  type FontView,
} from "@/lib/font-library";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: Array<{ value: FontSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "updated", label: "Recently updated" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "styles", label: "Most styles" },
  { value: "size", label: "Largest files" },
  { value: "foundry", label: "Foundry" },
];

const VIEW_OPTIONS = [
  ["grid", Grid3x3Icon, "Grid"],
  ["compact", LayoutGridIcon, "Compact"],
  ["list", ListIcon, "List"],
] as const;

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-full border px-4 text-sm transition-colors",
        pressed
          ? "border-foreground bg-foreground text-background hover:bg-foreground/90"
          : "border-border bg-background text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

export function FontLibraryToolbar({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  previewText,
  onPreviewTextChange,
  previewSize,
  onPreviewSizeChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  resultLabel,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  filters: FontLibraryFilters;
  onFiltersChange: (patch: Partial<FontLibraryFilters>) => void;
  previewText: string;
  onPreviewTextChange: (value: string) => void;
  previewSize: number;
  onPreviewSizeChange: (value: number) => void;
  sort: FontSort;
  onSortChange: (value: FontSort) => void;
  view: FontView;
  onViewChange: (value: FontView) => void;
  resultLabel: string;
}) {
  const activePreset =
    PREVIEW_PRESETS.find((preset) => preset.text === previewText)?.id ??
    (previewText === "" ? "name" : "custom");
  const extraFilterCount = countActiveFilters({
    ...filters,
    q: "",
    classifications: [],
  });
  const hasActiveFilters = countActiveFilters(filters) > 0;

  const toggleClassification = (value: (typeof CLASSIFICATIONS)[number]) => {
    onFiltersChange({
      classifications: filters.classifications.includes(value)
        ? filters.classifications.filter((item) => item !== value)
        : [...filters.classifications, value],
    });
  };

  return (
    <div className="border-b bg-background pt-1">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          placeholder="Search fonts"
          aria-label="Search fonts"
          onChange={(event) => onQueryChange(event.target.value)}
          className="h-12 w-full rounded-full bg-muted/80 pr-12 pl-12 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onFiltersChange({ q: "" })}
            className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {CLASSIFICATIONS.map((value) => (
          <Chip
            key={value}
            pressed={filters.classifications.includes(value)}
            onClick={() => toggleClassification(value)}
          >
            {CLASSIFICATION_LABELS[value]}
          </Chip>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors",
                extraFilterCount > 0
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              <SlidersHorizontalIcon className="size-3.5" />
              Filters
              {extraFilterCount > 0 ? (
                <span className="tabular-nums">{extraFilterCount}</span>
              ) : null}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 max-h-[min(32rem,70vh)] gap-4 overflow-y-auto p-4">
            <PopoverHeader>
              <PopoverTitle>Filters</PopoverTitle>
              <PopoverDescription>Language, technology, thickness, and more.</PopoverDescription>
            </PopoverHeader>
            <FontFilterPanel filters={filters} onFiltersChange={onFiltersChange} />
          </PopoverContent>
        </Popover>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={() => onFiltersChange(EMPTY_FILTERS)}
            className="ml-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Reset
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-y py-3 sm:flex-row sm:items-center">
        <Select
          value={activePreset}
          onValueChange={(value) => {
            const preset = PREVIEW_PRESETS.find((item) => item.id === value);
            if (preset) onPreviewTextChange(preset.text);
          }}
        >
          <SelectTrigger
            size="sm"
            className="w-auto border-0 bg-transparent px-1 shadow-none dark:bg-transparent"
          >
            <SelectValue placeholder="Sentence" />
          </SelectTrigger>
          <SelectContent>
            {PREVIEW_PRESETS.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.label}
              </SelectItem>
            ))}
            {PREVIEW_PRESETS.every((preset) => preset.text !== previewText) && previewText !== "" ? (
              <SelectItem value="custom">Custom</SelectItem>
            ) : null}
          </SelectContent>
        </Select>

        <input
          value={previewText}
          placeholder="Type something"
          aria-label="Preview text"
          onChange={(event) => onPreviewTextChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-center gap-3 sm:w-52">
          <Slider
            value={[previewSize]}
            min={24}
            max={96}
            aria-label="Preview size"
            onValueChange={([value]) => onPreviewSizeChange(value ?? 40)}
          />
          <span className="w-10 text-right text-sm tabular-nums text-muted-foreground">
            {previewSize}px
          </span>
        </div>

        <Select value={sort} onValueChange={(value) => onSortChange(value as FontSort)}>
          <SelectTrigger
            size="sm"
            className="w-auto border-0 bg-transparent px-1 shadow-none dark:bg-transparent"
          >
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex">
          {VIEW_OPTIONS.map(([value, Icon, label]) => (
            <Button
              key={value}
              variant={view === value ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label={label}
              aria-pressed={view === value}
              className="rounded-full"
              onClick={() => onViewChange(value)}
            >
              <Icon />
            </Button>
          ))}
        </div>
      </div>

      <p className="py-3 text-sm text-muted-foreground">{resultLabel}</p>
    </div>
  );
}
