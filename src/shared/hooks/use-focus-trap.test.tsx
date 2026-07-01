import { describe, expect, it } from "vitest";
import { useRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { useFocusTrap } from "./use-focus-trap";

function Harness({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <div ref={ref} tabIndex={-1}>
      <button type="button">first</button>
      <button type="button">middle</button>
      <button type="button">last</button>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("focuses the first focusable element when active", () => {
    const { getByText } = render(<Harness active />);
    expect(document.activeElement).toBe(getByText("first"));
  });

  it("cycles focus from last to first on Tab", () => {
    const { getByText } = render(<Harness active />);
    const last = getByText("last") as HTMLButtonElement;
    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(getByText("first"));
  });

  it("cycles focus from first to last on Shift+Tab", () => {
    const { getByText } = render(<Harness active />);
    const first = getByText("first") as HTMLButtonElement;
    first.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(getByText("last"));
  });

  it("does not move focus when not active", () => {
    const initiallyFocused = document.body;
    render(<Harness active={false} />);
    expect(document.activeElement).toBe(initiallyFocused);
  });

  it("does not intercept Tab when not active", () => {
    const { getByText } = render(<Harness active={false} />);
    const last = getByText("last") as HTMLButtonElement;
    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(last);
  });
});
