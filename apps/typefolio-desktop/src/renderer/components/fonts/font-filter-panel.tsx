"use client";

import { useMemo } from "react";

import { useLibrary } from "@/components/library/library-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  FORMATS,
  WEIGHT_FILTERS,
  collectFacets,
  familyFormats,
  familyHasItalic,
  familyHasWeight,
  familyIsVariable,
  familyMatchesFilters,
  formatLabel,
  type FontLibraryFilters,
  type WeightFilter,
} from "@/lib/font-library";
import type { FontExtension } from "@typefolio/core/types";

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>
      {children}
    </section>
  );
}

function FilterCheck({
  checked,
  label,
  count,
  onCheckedChange,
}: {
  checked: boolean;
  label: string;
  count?: number;
  onCheckedChange: () => void;
}) {
  return (
    <Label className="w-full min-w-0 cursor-pointer font-normal text-foreground">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count != null ? (
        <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
      ) : null}
    </Label>
  );
}

export function FontFilterPanel({
  filters,
  onFiltersChange,
}: {
  filters: FontLibraryFilters;
  onFiltersChange: (patch: Partial<FontLibraryFilters>) => void;
}) {
  const { families } = useLibrary();
  const facets = useMemo(() => collectFacets(families), [families]);

  const foundryOptions = useMemo(() => {
    const base = families.filter((family) =>
      familyMatchesFilters(family, { ...filters, foundries: [] }),
    );
    return facets.foundries.map((value) => ({
      value,
      count: base.filter((family) => (family.foundry ?? "Unknown foundry") === value).length,
    }));
  }, [families, facets.foundries, filters]);

  const languageOptions = useMemo(() => {
    const base = families.filter((family) =>
      familyMatchesFilters(family, { ...filters, languages: [] }),
    );
    return facets.languages.map((value) => ({
      value,
      count: base.filter((family) => (family.languages ?? []).includes(value)).length,
    }));
  }, [families, facets.languages, filters]);

  const formatOptions = useMemo(() => {
    const base = families.filter((family) =>
      familyMatchesFilters(family, { ...filters, formats: [] }),
    );
    return FORMATS.map((value) => ({
      value,
      count: base.filter((family) => familyFormats(family).includes(value)).length,
    })).filter((option) => option.count > 0 || filters.formats.includes(option.value));
  }, [families, filters]);

  const licenseOptions = useMemo(() => {
    const base = families.filter((family) =>
      familyMatchesFilters(family, { ...filters, licenses: [] }),
    );
    return facets.licenses.map((value) => ({
      value,
      count: base.filter((family) => (family.license ?? "Unknown") === value).length,
    }));
  }, [families, facets.licenses, filters]);

  const techCounts = useMemo(() => {
    const withoutTech = families.filter((family) =>
      familyMatchesFilters(family, { ...filters, saved: false, variable: false, italic: false }),
    );
    return {
      saved: withoutTech.filter((family) => family.favoritedAt).length,
      variable: withoutTech.filter(familyIsVariable).length,
      italic: withoutTech.filter(familyHasItalic).length,
    };
  }, [families, filters]);

  const weightCounts = useMemo(() => {
    const base = families.filter((family) =>
      familyMatchesFilters(family, { ...filters, weights: [] }),
    );
    return Object.fromEntries(
      WEIGHT_FILTERS.map((value) => [
        value,
        base.filter((family) => familyHasWeight(family, value)).length,
      ]),
    ) as Record<WeightFilter, number>;
  }, [families, filters]);

  return (
    <div className="grid gap-5">
      {languageOptions.length > 0 ? (
        <FilterSection title="Language">
          <Select
            value={filters.languages[0] ?? "all"}
            onValueChange={(value) =>
              onFiltersChange({ languages: value === "all" ? [] : [value] })
            }
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="All languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>
      ) : null}

      <FilterSection title="Technology">
        <div className="grid gap-2">
          <FilterCheck
            checked={filters.variable}
            label="Variable fonts"
            count={techCounts.variable}
            onCheckedChange={() => onFiltersChange({ variable: !filters.variable })}
          />
          <FilterCheck
            checked={filters.italic}
            label="Italic"
            count={techCounts.italic}
            onCheckedChange={() => onFiltersChange({ italic: !filters.italic })}
          />
          <FilterCheck
            checked={filters.saved}
            label="Saved"
            count={techCounts.saved}
            onCheckedChange={() => onFiltersChange({ saved: !filters.saved })}
          />
        </div>
      </FilterSection>

      {facets.maxStyles > 1 ? (
        <FilterSection title="Number of styles">
          <div className="flex items-center gap-3">
            <Slider
              value={[filters.minStyles]}
              min={0}
              max={facets.maxStyles}
              step={1}
              aria-label="Minimum number of styles"
              onValueChange={([value]) => onFiltersChange({ minStyles: value ?? 0 })}
            />
            <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
              {filters.minStyles > 0 ? `${filters.minStyles}+` : "Any"}
            </span>
          </div>
        </FilterSection>
      ) : null}

      <FilterSection title="Thickness">
        <div className="grid gap-2">
          {WEIGHT_FILTERS.map((value) => (
            <FilterCheck
              key={value}
              checked={filters.weights.includes(value)}
              label={value[0]!.toUpperCase() + value.slice(1)}
              count={weightCounts[value]}
              onCheckedChange={() =>
                onFiltersChange({ weights: toggleValue(filters.weights, value) })
              }
            />
          ))}
        </div>
      </FilterSection>

      {foundryOptions.length > 0 ? (
        <FilterSection title="Foundry">
          <div className="grid max-h-40 gap-2 overflow-y-auto pr-1">
            {foundryOptions.map((option) => (
              <FilterCheck
                key={option.value}
                checked={filters.foundries.includes(option.value)}
                label={option.value}
                count={option.count}
                onCheckedChange={() =>
                  onFiltersChange({ foundries: toggleValue(filters.foundries, option.value) })
                }
              />
            ))}
          </div>
        </FilterSection>
      ) : null}

      {formatOptions.length > 0 ? (
        <FilterSection title="Format">
          <div className="grid gap-2">
            {formatOptions.map((option) => (
              <FilterCheck
                key={option.value}
                checked={filters.formats.includes(option.value)}
                label={formatLabel(option.value)}
                count={option.count}
                onCheckedChange={() =>
                  onFiltersChange({
                    formats: toggleValue(filters.formats, option.value as FontExtension),
                  })
                }
              />
            ))}
          </div>
        </FilterSection>
      ) : null}

      {licenseOptions.length > 0 ? (
        <FilterSection title="License">
          <div className="grid max-h-40 gap-2 overflow-y-auto pr-1">
            {licenseOptions.map((option) => (
              <FilterCheck
                key={option.value}
                checked={filters.licenses.includes(option.value)}
                label={option.value}
                count={option.count}
                onCheckedChange={() =>
                  onFiltersChange({ licenses: toggleValue(filters.licenses, option.value) })
                }
              />
            ))}
          </div>
        </FilterSection>
      ) : null}
    </div>
  );
}
