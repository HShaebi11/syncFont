import type { FontClassification, FontExtension, FontFamilyGroup } from "@typefolio/core/types";

import { dateBucket } from "@/lib/format";

export const CLASSIFICATIONS: FontClassification[] = [
  "sans",
  "serif",
  "mono",
  "display",
  "other",
];

export const CLASSIFICATION_LABELS: Record<FontClassification, string> = {
  sans: "Sans Serif",
  serif: "Serif",
  mono: "Monospace",
  display: "Display",
  other: "Other",
};

export const FORMATS: FontExtension[] = [".otf", ".ttf", ".woff", ".woff2"];

export const WEIGHT_FILTERS = ["light", "regular", "bold"] as const;
export type WeightFilter = (typeof WEIGHT_FILTERS)[number];

export const FONT_SORTS = [
  "newest",
  "updated",
  "name-asc",
  "name-desc",
  "styles",
  "size",
  "foundry",
] as const;
export type FontSort = (typeof FONT_SORTS)[number];

export const FONT_VIEWS = ["grid", "compact", "list"] as const;
export type FontView = (typeof FONT_VIEWS)[number];

export const FONT_GROUPS = [
  "classification",
  "foundry",
  "added",
  "format",
  "letter",
  "none",
] as const;
export type FontGroupBy = (typeof FONT_GROUPS)[number];

const ADDED_ORDER = ["Today", "Yesterday", "This week", "Earlier"] as const;

export const PREVIEW_PRESETS = [
  { id: "sentence", label: "Sentence", text: "The quick brown fox jumps over the lazy dog." },
  { id: "hamburg", label: "Hamburg", text: "Hamburgefonstiv" },
  { id: "letters", label: "Letters", text: "AaBbCcDdEeFfGg" },
  { id: "numbers", label: "Numbers", text: "0123456789 $€£" },
  { id: "name", label: "Family name", text: "" },
] as const;

export interface FontLibraryFilters {
  q: string;
  classifications: FontClassification[];
  foundries: string[];
  saved: boolean;
  variable: boolean;
  italic: boolean;
  formats: FontExtension[];
  licenses: string[];
  languages: string[];
  moods: string[];
  weights: WeightFilter[];
  minStyles: number;
}

export const EMPTY_FILTERS: FontLibraryFilters = {
  q: "",
  classifications: [],
  foundries: [],
  saved: false,
  variable: false,
  italic: false,
  formats: [],
  licenses: [],
  languages: [],
  moods: [],
  weights: [],
  minStyles: 0,
};

export function isClassification(value: string): value is FontClassification {
  return CLASSIFICATIONS.includes(value as FontClassification);
}

export function isFontSort(value: string): value is FontSort {
  return FONT_SORTS.includes(value as FontSort);
}

export function isFontView(value: string): value is FontView {
  return FONT_VIEWS.includes(value as FontView);
}

export function isFontGroupBy(value: string): value is FontGroupBy {
  return FONT_GROUPS.includes(value as FontGroupBy);
}

export function isFontExtension(value: string): value is FontExtension {
  return FORMATS.includes(value as FontExtension);
}

export function isWeightFilter(value: string): value is WeightFilter {
  return WEIGHT_FILTERS.includes(value as WeightFilter);
}

export function familySlug(family: FontFamilyGroup): string {
  return family.slug ?? family.familyName;
}

export function familyIsVariable(family: FontFamilyGroup): boolean {
  return family.fonts.some((font) => (font.variableAxes?.length ?? 0) > 0);
}

export function familyHasItalic(family: FontFamilyGroup): boolean {
  return family.fonts.some((font) => font.italic);
}

export function familyHasWeight(family: FontFamilyGroup, weight: WeightFilter): boolean {
  return family.fonts.some((font) => {
    const value = font.weight ?? 400;
    if (weight === "light") return value <= 300;
    if (weight === "bold") return value >= 600;
    return value >= 400 && value <= 500;
  });
}

export function familyFormats(family: FontFamilyGroup): FontExtension[] {
  return Array.from(new Set(family.fonts.map((font) => font.extension)));
}

export function classificationLabel(value?: FontClassification | "unclassified"): string {
  if (!value || value === "unclassified") return "Unclassified";
  return CLASSIFICATION_LABELS[value];
}

function matchesSearch(family: FontFamilyGroup, q: string): boolean {
  if (!q.trim()) return true;
  const haystack = [
    family.familyName,
    family.foundry,
    family.source,
    family.license,
    family.classification,
    ...(family.mood ?? []),
    ...(family.languages ?? []),
    ...family.fonts.map((font) => font.styleName),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q.trim().toLowerCase());
}

export function familyMatchesFilters(
  family: FontFamilyGroup,
  filters: FontLibraryFilters,
): boolean {
  if (!matchesSearch(family, filters.q)) return false;
  if (filters.classifications.length && !family.classification) return false;
  if (
    filters.classifications.length &&
    family.classification &&
    !filters.classifications.includes(family.classification)
  ) {
    return false;
  }
  if (filters.foundries.length && !filters.foundries.includes(family.foundry ?? "Unknown foundry")) {
    return false;
  }
  if (filters.saved && !family.favoritedAt) return false;
  if (filters.variable && !familyIsVariable(family)) return false;
  if (filters.italic && !familyHasItalic(family)) return false;
  if (
    filters.formats.length &&
    !filters.formats.some((format) => familyFormats(family).includes(format))
  ) {
    return false;
  }
  if (filters.licenses.length && !filters.licenses.includes(family.license ?? "Unknown")) {
    return false;
  }
  if (
    filters.languages.length &&
    !filters.languages.some((language) => (family.languages ?? []).includes(language))
  ) {
    return false;
  }
  if (filters.moods.length && !filters.moods.some((mood) => (family.mood ?? []).includes(mood))) {
    return false;
  }
  if (filters.weights.length && !filters.weights.some((weight) => familyHasWeight(family, weight))) {
    return false;
  }
  if (filters.minStyles > 0 && family.styleCount < filters.minStyles) return false;
  return true;
}

export function sortFamilies(families: FontFamilyGroup[], sort: FontSort): FontFamilyGroup[] {
  return families.slice().sort((a, b) => {
    if (sort === "name-asc") return a.familyName.localeCompare(b.familyName);
    if (sort === "name-desc") return b.familyName.localeCompare(a.familyName);
    if (sort === "styles") return b.styleCount - a.styleCount;
    if (sort === "size") return (b.totalSize ?? 0) - (a.totalSize ?? 0);
    if (sort === "foundry") {
      return (a.foundry ?? "Unknown foundry").localeCompare(b.foundry ?? "Unknown foundry") ||
        a.familyName.localeCompare(b.familyName);
    }
    if (sort === "updated") return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });
}

export function applyFontLibraryQuery(
  families: FontFamilyGroup[],
  filters: FontLibraryFilters,
  sort: FontSort,
): FontFamilyGroup[] {
  return sortFamilies(families.filter((family) => familyMatchesFilters(family, filters)), sort);
}

export function countActiveFilters(filters: FontLibraryFilters): number {
  return (
    Number(Boolean(filters.q.trim())) +
    filters.classifications.length +
    filters.foundries.length +
    Number(filters.saved) +
    Number(filters.variable) +
    Number(filters.italic) +
    filters.formats.length +
    filters.licenses.length +
    filters.languages.length +
    filters.moods.length +
    filters.weights.length +
    Number(filters.minStyles > 0)
  );
}

export interface FilterChip {
  key: string;
  label: string;
  clear: Partial<FontLibraryFilters>;
}

export function filterChips(filters: FontLibraryFilters): FilterChip[] {
  const chips: FilterChip[] = [];
  if (filters.q.trim()) {
    chips.push({
      key: "q",
      label: `“${filters.q.trim()}”`,
      clear: { q: "" },
    });
  }
  for (const value of filters.classifications) {
    chips.push({
      key: `class-${value}`,
      label: CLASSIFICATION_LABELS[value],
      clear: { classifications: filters.classifications.filter((item) => item !== value) },
    });
  }
  for (const value of filters.foundries) {
    chips.push({
      key: `foundry-${value}`,
      label: value,
      clear: { foundries: filters.foundries.filter((item) => item !== value) },
    });
  }
  if (filters.saved) chips.push({ key: "saved", label: "Saved", clear: { saved: false } });
  if (filters.variable) chips.push({ key: "variable", label: "Variable", clear: { variable: false } });
  if (filters.italic) chips.push({ key: "italic", label: "Italic", clear: { italic: false } });
  for (const value of filters.formats) {
    chips.push({
      key: `format-${value}`,
      label: value.replace(".", "").toUpperCase(),
      clear: { formats: filters.formats.filter((item) => item !== value) },
    });
  }
  for (const value of filters.licenses) {
    chips.push({
      key: `license-${value}`,
      label: value,
      clear: { licenses: filters.licenses.filter((item) => item !== value) },
    });
  }
  for (const value of filters.languages) {
    chips.push({
      key: `lang-${value}`,
      label: value,
      clear: { languages: filters.languages.filter((item) => item !== value) },
    });
  }
  for (const value of filters.moods) {
    chips.push({
      key: `mood-${value}`,
      label: value,
      clear: { moods: filters.moods.filter((item) => item !== value) },
    });
  }
  for (const value of filters.weights) {
    chips.push({
      key: `weight-${value}`,
      label: value[0]!.toUpperCase() + value.slice(1),
      clear: { weights: filters.weights.filter((item) => item !== value) },
    });
  }
  if (filters.minStyles > 0) {
    chips.push({
      key: "styles",
      label: `${filters.minStyles}+ styles`,
      clear: { minStyles: 0 },
    });
  }
  return chips;
}

export interface FacetOption<T extends string = string> {
  value: T;
  label: string;
  count: number;
}

function uniqueSorted(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function collectFacets(families: FontFamilyGroup[]) {
  return {
    foundries: uniqueSorted(families.map((family) => family.foundry ?? "Unknown foundry")),
    licenses: uniqueSorted(families.map((family) => family.license ?? undefined)),
    languages: uniqueSorted(families.flatMap((family) => family.languages ?? [])),
    moods: uniqueSorted(families.flatMap((family) => family.mood ?? [])),
    maxStyles: families.reduce((max, family) => Math.max(max, family.styleCount), 1),
  };
}

export function classificationFacets(
  families: FontFamilyGroup[],
  filters: FontLibraryFilters,
): FacetOption<FontClassification>[] {
  const base = families.filter((family) =>
    familyMatchesFilters(family, { ...filters, classifications: [] }),
  );
  return CLASSIFICATIONS.map((value) => ({
    value,
    label: CLASSIFICATION_LABELS[value],
    count: base.filter((family) => (family.classification ?? "other") === value).length,
  }));
}

function familyGroupKey(family: FontFamilyGroup, groupBy: Exclude<FontGroupBy, "none">): string {
  if (groupBy === "classification") return family.classification ?? "other";
  if (groupBy === "foundry") return family.foundry ?? "Unknown foundry";
  if (groupBy === "added") return dateBucket(family.createdAt ?? family.updatedAt ?? "");
  if (groupBy === "format") return familyFormats(family)[0] ?? ".otf";
  return family.familyName.charAt(0).toUpperCase() || "#";
}

function groupLabel(groupBy: FontGroupBy, key: string): string {
  if (groupBy === "classification") {
    return classificationLabel(key as FontClassification | "unclassified");
  }
  if (groupBy === "format") return formatLabel(key);
  return key;
}

export function groupFamilies(
  families: FontFamilyGroup[],
  groupBy: FontGroupBy,
  options: { keepEmptyStyles?: boolean } = {},
): Array<{ key: string; label: string; families: FontFamilyGroup[] }> {
  if (groupBy === "none") {
    return [{ key: "all", label: "", families }];
  }

  const buckets = new Map<string, FontFamilyGroup[]>();
  for (const family of families) {
    const key = familyGroupKey(family, groupBy);
    const list = buckets.get(key) ?? [];
    list.push(family);
    buckets.set(key, list);
  }

  const keys =
    groupBy === "classification" && options.keepEmptyStyles
      ? [...CLASSIFICATIONS]
      : groupBy === "classification"
        ? CLASSIFICATIONS.filter((key) => (buckets.get(key)?.length ?? 0) > 0)
        : groupBy === "added"
          ? ADDED_ORDER.filter((key) => buckets.has(key))
          : groupBy === "format"
            ? FORMATS.filter((key) => buckets.has(key))
            : Array.from(buckets.keys()).sort((a, b) => a.localeCompare(b));

  return keys.map((key) => ({
    key,
    label: groupLabel(groupBy, key),
    families: buckets.get(key) ?? [],
  }));
}

export function parseCsv(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function toCsv(values: string[]): string {
  return values.join(",");
}

export function readFontLibraryFilters(params: URLSearchParams): FontLibraryFilters {
  return {
    q: params.get("q") ?? "",
    classifications: parseCsv(params.get("classification")).filter(isClassification),
    foundries: parseCsv(params.get("foundry")),
    saved: params.get("saved") === "1",
    variable: params.get("variable") === "1",
    italic: params.get("italic") === "1",
    formats: parseCsv(params.get("format")).filter(isFontExtension),
    licenses: parseCsv(params.get("license")),
    languages: parseCsv(params.get("language")),
    moods: parseCsv(params.get("mood")),
    weights: parseCsv(params.get("weight")).filter(isWeightFilter),
    minStyles: Number(params.get("styles") ?? 0) || 0,
  };
}

export function fontLibraryFilterParams(filters: FontLibraryFilters): Record<string, string | null> {
  return {
    q: filters.q.trim() || null,
    classification: toCsv(filters.classifications) || null,
    foundry: toCsv(filters.foundries) || null,
    saved: filters.saved ? "1" : null,
    variable: filters.variable ? "1" : null,
    italic: filters.italic ? "1" : null,
    format: toCsv(filters.formats) || null,
    license: toCsv(filters.licenses) || null,
    language: toCsv(filters.languages) || null,
    mood: toCsv(filters.moods) || null,
    weight: toCsv(filters.weights) || null,
    styles: filters.minStyles > 0 ? String(filters.minStyles) : null,
  };
}

export function fontsHref(params: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(params.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  const qs = next.toString();
  return qs ? `/fonts?${qs}` : "/fonts";
}

export function formatLabel(value: string): string {
  return value.replace(".", "").toUpperCase();
}
