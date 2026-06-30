import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePortalMounted } from "./use-portal-mounted";

describe("usePortalMounted", () => {
  it("returns true after mount", () => {
    const { result } = renderHook(() => usePortalMounted());
    expect(result.current).toBe(true);
  });
});
