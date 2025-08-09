"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export type LocationValue = {
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
};

export default function LocationSelector({
  defaultCountry,
  defaultState,
  defaultCity,
  defaultPostalCode,
  value,
  onChange,
}: {
  defaultCountry?: string;
  defaultState?: string;
  defaultCity?: string;
  defaultPostalCode?: string;
  value?: LocationValue;
  onChange?: (value: LocationValue) => void;
}) {
  const [countries, setCountries] = useState<Array<{ country: string }>>([]);
  const [regions, setRegions] = useState<Array<{ name: string }>>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Initial countries
  useEffect(() => {
    let active = true;
    setLoadingCountries(true);
    fetch("https://countriesnow.space/api/v0.1/countries")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setCountries(Array.isArray(data?.data) ? data.data : []);
      })
      .finally(() => active && setLoadingCountries(false));
    return () => {
      active = false;
    };
  }, []);

  // Prefill defaults on mount/prop change
  useEffect(() => {
    if (value) return; // controlled mode takes precedence
    if (defaultCountry) setSelectedCountry(defaultCountry);
    if (defaultState) setSelectedRegion(defaultState);
    if (defaultCity) setSelectedCity(defaultCity);
    if (defaultPostalCode) setPostalCode(defaultPostalCode);
     
  }, [defaultCountry, defaultState, defaultCity, defaultPostalCode, value]);

  // Controlled value support
  useEffect(() => {
    if (!value) return;
    setSelectedCountry(value.country || "");
    setSelectedRegion(value.state || "");
    setSelectedCity(value.city || "");
    setPostalCode(value.postalCode || "");
  }, [value?.country, value?.state, value?.city, value?.postalCode]);

  // Load regions when country changes
  useEffect(() => {
    if (!selectedCountry) {
      setRegions([]);
      setSelectedRegion("");
      return;
    }
    setLoadingRegions(true);
    fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: selectedCountry }),
    })
      .then((res) => res.json())
      .then((data) =>
        setRegions(Array.isArray(data?.data?.states) ? data.data.states : [])
      )
      .finally(() => setLoadingRegions(false));
  }, [selectedCountry]);

  // Once regions load, if default exists and none selected, apply it
  useEffect(() => {
    if (value) return; // controlled mode
    if (!selectedRegion && defaultState && regions.length > 0) {
      setSelectedRegion(defaultState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions.length, defaultState, value]);

  // Load cities when region changes
  useEffect(() => {
    if (!selectedCountry || !selectedRegion) {
      setCities([]);
      setSelectedCity("");
      return;
    }
    setLoadingCities(true);
    fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: selectedCountry, state: selectedRegion }),
    })
      .then((res) => res.json())
      .then((data) => setCities(Array.isArray(data?.data) ? data.data : []))
      .finally(() => setLoadingCities(false));
  }, [selectedCountry, selectedRegion]);

  // Once cities load, if default exists and none selected, apply it
  useEffect(() => {
    if (value) return; // controlled mode
    if (!selectedCity && defaultCity && cities.length > 0) {
      setSelectedCity(defaultCity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities.length, defaultCity, value]);

  // Emit changes
  useEffect(() => {
    onChange?.({
      country: selectedCountry,
      state: selectedRegion,
      city: selectedCity,
      postalCode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, selectedRegion, selectedCity, postalCode]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Country</label>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={loadingCountries ? "Loading..." : "Select country"}
            />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {loadingCountries ? (
              <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading
                countries...
              </div>
            ) : (
              countries.map((c) => (
                <SelectItem key={c.country} value={c.country}>
                  {c.country}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {regions.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">State/Region</label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  loadingRegions ? "Loading..." : "Select state/region"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {loadingRegions ? (
                <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading states...
                </div>
              ) : (
                regions.map((r) => (
                  <SelectItem key={r.name} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {cities.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={loadingCities ? "Loading..." : "Select city"}
              />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {loadingCities ? (
                <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading cities...
                </div>
              ) : (
                cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Postal code</label>
        <Input
          placeholder="Postal code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />
      </div>
    </div>
  );
}
