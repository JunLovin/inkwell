import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useToastStore } from "./toast.store";

const reset = () => useToastStore.setState({ toasts: [] });

describe("useToastStore", () => {
  beforeEach(reset);
  afterEach(reset);

  it("starts empty", () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it("add() appends a toast with a generated id and returns it", () => {
    const id = useToastStore.getState().add({ title: "Hi" });
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({ id, title: "Hi" });
  });

  it("add() generates unique ids per call", () => {
    const a = useToastStore.getState().add({ title: "a" });
    const b = useToastStore.getState().add({ title: "b" });
    expect(a).not.toBe(b);
    expect(useToastStore.getState().toasts).toHaveLength(2);
  });

  it("remove() removes by id", () => {
    const id = useToastStore.getState().add({ title: "x" });
    useToastStore.getState().add({ title: "y" });
    useToastStore.getState().remove(id);
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].title).toBe("y");
  });

  it("remove() is a no-op when id does not exist", () => {
    useToastStore.getState().add({ title: "a" });
    useToastStore.getState().remove("missing");
    expect(useToastStore.getState().toasts).toHaveLength(1);
  });
});
