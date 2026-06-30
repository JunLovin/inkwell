import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { List, type ListItem } from "./List";

const items: ListItem[] = [
  { id: "1", label: "Inbox", description: "12 messages" },
  { id: "2", label: "Sent" },
  { id: "3", label: "Trash", disabled: true },
];

describe("List", () => {
  it("renders every item label", () => {
    render(<List items={items} />);
    items.forEach((i) => expect(screen.getByText(i.label)).toBeInTheDocument());
  });

  it("renders description text", () => {
    render(<List items={items} />);
    expect(screen.getByText("12 messages")).toBeInTheDocument();
  });

  it("fires onClick when item is clickable and enabled", () => {
    const onClick = vi.fn();
    render(<List items={[{ id: "1", label: "X", onClick }]} />);
    fireEvent.click(screen.getByText("X"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(<List items={[{ id: "1", label: "X", onClick, disabled: true }]} />);
    fireEvent.click(screen.getByText("X"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders dividers between items when divided=true", () => {
    const { container } = render(<List items={items} divided />);
    const dividers = container.querySelectorAll("div.bg-zinc-800\\/60");
    expect(dividers.length).toBeGreaterThan(0);
  });

  it("renders leading and trailing slots", () => {
    render(
      <List
        items={[
          {
            id: "1",
            label: "X",
            leading: <span data-testid="l" />,
            trailing: <span data-testid="t" />,
          },
        ]}
      />,
    );
    expect(screen.getByTestId("l")).toBeInTheDocument();
    expect(screen.getByTestId("t")).toBeInTheDocument();
  });
});
