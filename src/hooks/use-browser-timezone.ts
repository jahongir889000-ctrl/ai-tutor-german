"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
const getTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

let zones: string[] | null = null;
const getZones = () => {
  if (!zones) {
    try {
      zones = Intl.supportedValuesOf("timeZone");
    } catch {
      zones = [getTz(), "UTC"];
    }
  }
  return zones;
};
const EMPTY: string[] = [];

/** The browser's IANA timezone ("" during server render). */
export function useBrowserTimezone() {
  return useSyncExternalStore(noopSubscribe, getTz, () => "");
}

/** All IANA timezones supported by the browser. */
export function useTimezoneList() {
  return useSyncExternalStore(noopSubscribe, getZones, () => EMPTY);
}
