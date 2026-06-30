import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToastStore } from "@/shared/stores/toast.store";
import { toast, useToast } from "./use-toast";

const reset = () => useToastStore.setState({ toasts: [] });

describe("toast (module-level helper)", () => {
  beforeEach(reset);
  afterEach(reset);

  it("accepts a string and assigns the variant", () => {
    toast.success("Saved");
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({ title: "Saved", variant: "success" });
  });

  it("accepts an object with description", () => {
    toast.danger({ title: "Fail", description: "oops" });
    expect(useToastStore.getState().toasts[0]).toMatchObject({
      title: "Fail",
      description: "oops",
      variant: "danger",
    });
  });

  it("error is an alias for danger", () => {
    toast.error("boom");
    expect(useToastStore.getState().toasts[0]?.variant).toBe("danger");
  });

  it("supports default, info, warning variants", () => {
    toast.default("a");
    toast.info("b");
    toast.warning("c");
    const variants = useToastStore.getState().toasts.map((t) => t.variant);
    expect(variants).toEqual(["default", "info", "warning"]);
  });
});

describe("useToast", () => {
  beforeEach(reset);
  afterEach(reset);

  it("exposes variant methods and remove", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.success("Hi");
    });
    expect(useToastStore.getState().toasts).toHaveLength(1);
    const id = useToastStore.getState().toasts[0].id;
    act(() => {
      result.current.remove(id);
    });
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
