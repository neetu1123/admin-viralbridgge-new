'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { locationsApi, type LocationOption } from '@/src/lib/api';

type LocationValue = {
  country: string;
  state: string;
  city: string;
};

type SearchFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  helper?: string;
  loadOptions: (query: string) => Promise<LocationOption[]>;
  onSelect: (option: LocationOption) => void;
  onClear: () => void;
};

function SearchField({ label, value, placeholder, disabled, helper, loadOptions, onSelect, onClear }: SearchFieldProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    if (!open || disabled) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      loadOptions(query.trim())
        .then((rows) => {
          if (!cancelled) setOptions(rows);
        })
        .catch(() => {
          if (!cancelled) setOptions([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, disabled, query, loadOptions]);

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-1.5 block text-xs font-semibold text-slate-600" htmlFor={listId}>
        {label}
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          id={listId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setQuery(value), 150);
          }}
          className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-8 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:bg-slate-50 disabled:text-slate-400"
        />
        {value ? (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      {helper ? <p className="mt-1 text-[11px] text-slate-400">{helper}</p> : null}
      {open && !disabled ? (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg" role="listbox">
          {loading ? <li className="px-3 py-2 text-xs text-slate-400">Searching…</li> : null}
          {!loading && options.length === 0 ? <li className="px-3 py-2 text-xs text-slate-400">No matches</li> : null}
          {options.map((option) => (
            <li key={`${option.isoCode}-${option.name}`}>
              <button
                type="button"
                role="option"
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-50"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(option);
                  setQuery(option.name);
                  setOpen(false);
                }}
              >
                {option.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function LocationPicker({
  country,
  stateName,
  city,
  onChange,
}: {
  country: string;
  stateName: string;
  city: string;
  onChange: (next: LocationValue) => void;
}) {
  const [countryCode, setCountryCode] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [hasStates, setHasStates] = useState(true);

  useEffect(() => {
    if (!country.trim() && !stateName.trim()) {
      setCountryCode('');
      setStateCode('');
      setHasStates(true);
      return;
    }
    let cancelled = false;
    locationsApi
      .resolve(country, stateName)
      .then((match) => {
        if (cancelled) return;
        setCountryCode(match.country?.isoCode ?? '');
        setStateCode(match.state?.isoCode ?? '');
        setHasStates(match.hasStates);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [country, stateName]);

  const loadCountries = React.useCallback((query: string) => locationsApi.countries(query), []);
  const loadStates = React.useCallback(
    (query: string) => locationsApi.states(countryCode, query).then((result) => result.states),
    [countryCode],
  );
  const loadCities = React.useCallback(
    (query: string) => locationsApi.cities(countryCode, hasStates ? stateCode : undefined, query),
    [countryCode, hasStates, stateCode],
  );

  return (
    <div>
      <p className="mb-3 text-xs text-slate-500">Search country first, then state, then city.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SearchField
          label="Country"
          value={country}
          placeholder="Search country"
          loadOptions={loadCountries}
          onSelect={(option) => {
            setCountryCode(option.isoCode);
            setStateCode('');
            setHasStates(true);
            onChange({ country: option.name, state: '', city: '' });
            locationsApi.states(option.isoCode).then((result) => setHasStates(result.hasStates)).catch(() => undefined);
          }}
          onClear={() => {
            setCountryCode('');
            setStateCode('');
            setHasStates(true);
            onChange({ country: '', state: '', city: '' });
          }}
        />
        <SearchField
          label="State"
          value={stateName}
          placeholder={countryCode ? (hasStates ? 'Search state' : 'No states for this country') : 'Select a country first'}
          disabled={!countryCode || !hasStates}
          loadOptions={loadStates}
          onSelect={(option) => {
            setStateCode(option.isoCode);
            onChange({ country, state: option.name, city: '' });
          }}
          onClear={() => {
            setStateCode('');
            onChange({ country, state: '', city: '' });
          }}
        />
        <SearchField
          label="City"
          value={city}
          placeholder={!countryCode ? 'Select a country first' : hasStates && !stateCode ? 'Select a state first' : 'Search city'}
          disabled={!countryCode || (hasStates && !stateCode)}
          loadOptions={loadCities}
          onSelect={(option) => onChange({ country, state: stateName, city: option.name })}
          onClear={() => onChange({ country, state: stateName, city: '' })}
        />
      </div>
    </div>
  );
}
