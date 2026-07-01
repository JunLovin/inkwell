import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("gsap", () => import("@/shared/__test-utils__/mock-gsap"));

import { Dropdown, DropdownTrigger } from "./Dropdown";

describe("Dropdown", () => {
  it("renders the trigger", () => {
    render(<Dropdown trigger={<button>open</button>} items={[]} />);
    expect(screen.getByText("open")).toBeInTheDocument();
  });

  it("renders items in a portal when open", () => {
    render(
      <Dropdown
        trigger={<button>open</button>}
        items={[
          { id: "1", label: "Edit" },
          { id: "2", label: "Delete", variant: "danger" },
        ]}
      />,
    );
    fireEvent.click(screen.getByText("open"));
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("fires onSelect with the item id", () => {
    const onSelect = vi.fn();
    render(
      <Dropdown
        trigger={<button>open</button>}
        items={[{ id: "edit", label: "Edit" }]}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText("open"));
    fireEvent.click(screen.getByText("Edit"));
    expect(onSelect).toHaveBeenCalledWith("edit");
  });

  it("does not fire onSelect for disabled items", () => {
    const onSelect = vi.fn();
    render(
      <Dropdown
        trigger={<button>open</button>}
        items={[{ id: "x", label: "Disabled", disabled: true }]}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText("open"));
    fireEvent.click(screen.getByText("Disabled"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders a separator entry as a divider, not a button", () => {
    render(
      <Dropdown
        trigger={<button>open</button>}
        items={[{ id: "s", label: "x", separator: true }]}
      />,
    );
    fireEvent.click(screen.getByText("open"));
    expect(screen.queryByRole("button", { name: "x" })).not.toBeInTheDocument();
  });
});

describe("DropdownTrigger", () => {
  it("renders children and a chevron by default", () => {
    const { container } = render(<DropdownTrigger>Menu</DropdownTrigger>);
    expect(screen.getByText("Menu")).toBeInTheDocument();
    expect(container.querySelectorAll("svg").length).toBeGreaterThan(0);
  });

  it("hides the chevron when chevron=false", () => {
    const { container } = render(
      <DropdownTrigger chevron={false}>Menu</DropdownTrigger>,
    );
    expect(container.querySelectorAll("svg").length).toBe(0);
  });
});
