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
    render(<Avatar name="Alice Smith" />);
    expect(screen.getByText("AS")).toBeInTheDocument();
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

  it("marks the online indicator with data-online=true", () => {
    const { container } = render(<Avatar name="A" online />);
    expect(container.querySelector('[data-online="true"]')).toBeInTheDocument();
  });

  it("marks the offline indicator with data-online=false", () => {
    const { container } = render(<Avatar name="A" online={false} />);
    expect(
      container.querySelector('[data-online="false"]'),
    ).toBeInTheDocument();
  });

  it("omits the indicator entirely when online is undefined", () => {
    const { container } = render(<Avatar name="A" />);
    expect(container.querySelector("[data-online]")).not.toBeInTheDocument();
  });
});
