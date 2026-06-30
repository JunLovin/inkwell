import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it.each(["sm", "md", "lg"] as const)("renders size %s", (size) => {
    const { container } = render(<Spinner size={size} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("defaults to size md", () => {
    const { container } = render(<Spinner />);
    expect((container.firstChild as HTMLElement).className).toMatch(/w-6/);
  });

  it("uses animate-spin", () => {
    const { container } = render(<Spinner />);
    expect((container.firstChild as HTMLElement).className).toMatch(
      /animate-spin/,
    );
  });
});
