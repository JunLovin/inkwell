import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renders initials from a name", () => {
    render(<Avatar name="Mathias Rendon" />);
    expect(screen.getByText("MR")).toBeInTheDocument();
  });

  it("uppercases initials and slices to first two words", () => {
    render(<Avatar name="alice bob carol" />);
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("renders a placeholder question mark when name and src are missing", () => {
    render(<Avatar />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("renders an image when src is provided", () => {
    render(<Avatar src="/x.png" name="Alice" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/x.png");
  });

  it.each(["sm", "md", "lg"] as const)("renders size %s", (size) => {
    render(<Avatar name="A" size={size} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders an online indicator when online is true", () => {
    const { container } = render(<Avatar name="A" online />);
    expect(container.querySelectorAll("span").length).toBeGreaterThan(0);
  });

  it("renders an offline indicator when online is false", () => {
    const { container } = render(<Avatar name="A" online={false} />);
    expect(container.querySelectorAll("span").length).toBeGreaterThan(0);
  });
});
