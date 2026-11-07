import { describe, expect, it } from "vitest";
import { resolveInput } from "../src/lib/helper";

describe("resolveInput", () => {
  it("resolves a valid address", () => {
    expect(resolveInput("tidepool.zz")).toEqual({
      kind: "address",
      address: "tidepool.zz",
    });
  });

  it("normalizes uppercase addresses and zz:// prefixes", () => {
    expect(resolveInput("ZZ://TIDEPOOL.ZZ")).toEqual({
      kind: "address",
      address: "tidepool.zz",
    });
  });

  it("trims surrounding whitespace from an address", () => {
    expect(resolveInput("  tidepool.zz  ")).toEqual({
      kind: "address",
      address: "tidepool.zz",
    });
  });

  it("treats a plain word as a search query", () => {
    expect(resolveInput("tidepool")).toEqual({
      kind: "search",
      query: "tidepool",
    });
  });

  it("preserves a multi-word search query", () => {
    expect(resolveInput("patient tidepool")).toEqual({
      kind: "search",
      query: "patient tidepool",
    });
  });

  it("treats an invalid address as a search query", () => {
    expect(resolveInput("bad_address")).toEqual({
      kind: "search",
      query: "bad_address",
    });
  });

  it("treats a valid but misspelled address as an address", () => {
    expect(resolveInput("tidepol.zz")).toEqual({
      kind: "address",
      address: "tidepol.zz",
    });
  });

  it("returns empty for an empty string", () => {
    expect(resolveInput("")).toEqual({ kind: "empty" });
  });

  it("returns empty for whitespace only", () => {
    expect(resolveInput(" \t\n ")).toEqual({ kind: "empty" });
  });
});
