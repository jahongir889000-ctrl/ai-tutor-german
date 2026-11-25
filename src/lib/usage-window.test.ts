import { describe, expect, it } from "vitest";
import { getNextReset, getUsageWindowStart, safeTimeZone } from "./usage-window";

describe("getUsageWindowStart", () => {
  it("returns today's noon after 12:00 local (Tashkent, UTC+5)", () => {
    const now = new Date("2026-11-21T09:30:00Z"); // 14:30 in Tashkent
    expect(getUsageWindowStart("Asia/Tashkent", now).toISOString()).toBe(
      "2026-11-21T07:00:00.000Z",
    );
  });

  it("returns yesterday's noon before 12:00 local", () => {
    const now = new Date("2026-11-21T05:00:00Z"); // 10:00 in Tashkent
    expect(getUsageWindowStart("Asia/Tashkent", now).toISOString()).toBe(
      "2026-11-20T07:00:00.000Z",
    );
  });

  it("treats exactly 12:00 as the start of a new window", () => {
    const now = new Date("2026-11-21T07:00:00Z"); // 12:00 Tashkent
    expect(getUsageWindowStart("Asia/Tashkent", now).toISOString()).toBe(
      "2026-11-21T07:00:00.000Z",
    );
  });

  it("handles negative offsets (New York)", () => {
    const now = new Date("2026-11-21T15:00:00Z"); // 10:00 EST
    expect(getUsageWindowStart("America/New_York", now).toISOString()).toBe(
      "2026-11-20T17:00:00.000Z",
    );
  });

  it("handles a DST change between windows (Berlin, spring forward)", () => {
    // 2026-03-29 clocks go 02:00 -> 03:00 in Berlin. Window started 2026-03-28 12:00 CET.
    const now = new Date("2026-03-29T09:00:00Z"); // 11:00 CEST
    expect(getUsageWindowStart("Europe/Berlin", now).toISOString()).toBe(
      "2026-03-28T11:00:00.000Z",
    );
    expect(getNextReset("Europe/Berlin", now).toISOString()).toBe("2026-03-29T10:00:00.000Z");
  });

  it("crosses month boundaries", () => {
    const now = new Date("2026-12-01T00:30:00Z"); // 05:30 Tashkent, Dec 1
    expect(getUsageWindowStart("Asia/Tashkent", now).toISOString()).toBe(
      "2026-11-30T07:00:00.000Z",
    );
  });
});

describe("getNextReset", () => {
  it("is today's noon before noon and tomorrow's noon after", () => {
    expect(getNextReset("UTC", new Date("2026-11-21T08:00:00Z")).toISOString()).toBe(
      "2026-11-21T12:00:00.000Z",
    );
    expect(getNextReset("UTC", new Date("2026-11-21T13:00:00Z")).toISOString()).toBe(
      "2026-11-22T12:00:00.000Z",
    );
  });
});

describe("safeTimeZone", () => {
  it("falls back to UTC for invalid zones", () => {
    expect(safeTimeZone("Mars/Olympus")).toBe("UTC");
    expect(safeTimeZone(undefined)).toBe("UTC");
    expect(safeTimeZone("Europe/Berlin")).toBe("Europe/Berlin");
  });
});
