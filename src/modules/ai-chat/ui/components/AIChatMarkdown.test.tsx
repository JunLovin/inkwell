import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIChatMarkdown } from "./AIChatMarkdown";

describe("AIChatMarkdown", () => {
  it("renders a paragraph", () => {
    render(<AIChatMarkdown content="hello world" />);
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("renders headings with semantic h1/h2/h3 tags", () => {
    render(<AIChatMarkdown content={"# h1\n## h2\n### h3"} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "h1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "h2" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "h3" }),
    ).toBeInTheDocument();
  });

  it("renders an unordered list", () => {
    const { container } = render(<AIChatMarkdown content={"- one\n- two"} />);
    expect(container.querySelectorAll("ul li").length).toBe(2);
  });

  it("renders an ordered list", () => {
    const { container } = render(<AIChatMarkdown content={"1. one\n2. two"} />);
    expect(container.querySelectorAll("ol li").length).toBe(2);
  });

  it("renders a fenced code block", () => {
    const { container } = render(
      <AIChatMarkdown content={"```ts\nconst x = 1\n```"} />,
    );
    expect(container.querySelector("pre code")).toHaveTextContent(
      "const x = 1",
    );
  });

  it("renders inline code, bold, italic", () => {
    const { container } = render(
      <AIChatMarkdown content={"use `code`, **bold**, *italic* together"} />,
    );
    expect(container.querySelector("code")).toHaveTextContent("code");
    expect(container.querySelector("strong")).toHaveTextContent("bold");
    expect(container.querySelector("em")).toHaveTextContent("italic");
  });

  it("ignores blank lines", () => {
    const { container } = render(<AIChatMarkdown content={"\n\nhi\n\n"} />);
    expect(container.querySelectorAll("p").length).toBe(1);
  });
});
