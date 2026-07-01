import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("gsap", () => import("@/shared/__test-utils__/mock-gsap"));

import { Drawer } from "./Drawer";

describe("Drawer", () => {
  it("renders title and children when open", () => {
    render(
      <Drawer open onClose={() => {}} title="Note Drawer">
        <div>content</div>
      </Drawer>,
    );
    expect(screen.getByText("Note Drawer")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="t">
        x
      </Drawer>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="t">
        x
      </Drawer>,
    );
    fireEvent.click(screen.getByLabelText("Close drawer"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders the expand button when onExpand is provided", () => {
    const onExpand = vi.fn();
    render(
      <Drawer
        open
        onClose={() => {}}
        title="t"
        onExpand={onExpand}
        expandLabel="Open full"
      >
        x
      </Drawer>,
    );
    fireEvent.click(screen.getByText("Open full"));
    expect(onExpand).toHaveBeenCalledOnce();
  });

  it("renders custom action nodes", () => {
    render(
      <Drawer
        open
        onClose={() => {}}
        title="t"
        actions={<button>extra</button>}
      >
        x
      </Drawer>,
    );
    expect(screen.getByText("extra")).toBeInTheDocument();
  });
});
