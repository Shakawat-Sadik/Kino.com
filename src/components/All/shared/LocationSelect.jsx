"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import bdLocations from "@/lib/bd-locations.json";

// When no district is picked, every area in the country is listed; areas share
// names across districts, so the option value carries its district to stay unique.
const AREA_SEP = "__";

function findDivisionOf(districtName) {
  return bdLocations.find((d) => d.districts.some((x) => x.district === districtName))?.division;
}

/** Prepend `current` when it isn't one of `names`, so stored legacy values still show and survive a save. */
function withCurrent(names, current) {
  return current && !names.includes(current) ? [current, ...names] : names;
}

/**
 * Division → District → Area picker backed by bd-locations.json.
 *
 * Controlled: `value` is a location object ({ country, division, district, area });
 * `onChange` receives the next full object (country and any other keys preserved).
 * Picking a district or area auto-fills its parent division/district.
 */
export function LocationSelect({ value, onChange, className = "" }) {
  const division = value?.division || "";
  const district = value?.district || "";
  const area = value?.area || "";

  const update = (patch) => onChange({ ...value, ...patch });

  const divisionOptions = useMemo(
    () => withCurrent(bdLocations.map((d) => d.division), division),
    [division],
  );

  const availableDistricts = useMemo(() => {
    if (division) {
      return bdLocations.find((d) => d.division === division)?.districts ?? [];
    }
    return bdLocations.flatMap((d) => d.districts);
  }, [division]);

  const districtOptions = useMemo(
    () => withCurrent(availableDistricts.map((d) => d.district), district),
    [availableDistricts, district],
  );

  const areaOptions = useMemo(() => {
    let options;
    if (district) {
      const dist = availableDistricts.find((d) => d.district === district);
      options = dist ? dist.areas.map((a) => ({ value: a, label: a })) : [];
    } else {
      options = availableDistricts.flatMap((dist) =>
        dist.areas.map((a) => ({ value: `${a}${AREA_SEP}${dist.district}`, label: a })),
      );
    }
    if (area && !options.some((o) => o.value === area)) {
      options = [{ value: area, label: area }, ...options];
    }
    return options;
  }, [availableDistricts, district, area]);

  const handleDivisionChange = (next) => {
    update({ division: next, district: "", area: "" });
  };

  const handleDistrictChange = (next) => {
    update({
      district: next,
      area: "",
      division: division || findDivisionOf(next) || "",
    });
  };

  const handleAreaChange = (next) => {
    let nextArea = next;
    let targetDistrict = district;
    if (next.includes(AREA_SEP)) {
      [nextArea, targetDistrict] = next.split(AREA_SEP);
    }

    const patch = { area: nextArea };
    const districtChanged = targetDistrict && targetDistrict !== district;
    if (districtChanged) patch.district = targetDistrict;
    if (!division || districtChanged) {
      const div = findDivisionOf(targetDistrict);
      if (div) patch.division = div;
    }
    update(patch);
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 ${className}`}>
      <Select value={division} onValueChange={handleDivisionChange}>
        <SelectTrigger className="w-full"><SelectValue placeholder="Division" /></SelectTrigger>
        <SelectContent>
          {divisionOptions.map((name) => (
            <SelectItem key={name} value={name}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={district} onValueChange={handleDistrictChange}>
        <SelectTrigger className="w-full"><SelectValue placeholder="District" /></SelectTrigger>
        <SelectContent>
          {districtOptions.map((name) => (
            <SelectItem key={name} value={name}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={area} onValueChange={handleAreaChange}>
        <SelectTrigger className="w-full"><SelectValue placeholder="Area" /></SelectTrigger>
        <SelectContent>
          {areaOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
