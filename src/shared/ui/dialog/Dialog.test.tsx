import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("gsap", () => {
  const chain = () => ({
    to: () => chain(),
    fromTo: () => chain(),
    set: () => chain(),
  });
  return {
    default: {
      to: () => chain(),
      fromTo: () => chain(),
      set: () => chain(),
      timeline: () => chain(),
    },
  };
});

import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("does not throw when closed", () => {
    expect(() =>
      render(
        <Dialog open={false} onClose={() => {}} title="t">
          body
        </Dialog>,
      ),
    ).not.toThrow();
  });

  it("renders title, description and content when open", () => {
    render(
      <Dialog open onClose={() => {}} title="My title" description="desc">
        <div>hello</div>
      </Dialog>,
    );
    expect(screen.getByText("My title")).toBeInTheDocument();
    expect(screen.getByText("desc")).toBeInTheDocument();
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("fires onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="t">
        x
      </Dialog>,
    );
    fireEvent.click(screen.getByLabelText("Close dialog"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("fires onClose on Escape key when open", () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="t">
        x
      </Dialog>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders actions", () => {
    const onClick = vi.fn();
    render(
      <Dialog
        open
        onClose={() => {}}
        title="t"
        actions={[{ label: "Save", onClick }]}
      >
        x
      </Dialog>,
    );
    fireEvent.click(screen.getByText("Save"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not render header or footer in bare mode", () => {
    render(
      <Dialog open onClose={() => {}} title="t" bare>
        <p>bare content</p>
      </Dialog>,
    );
    expect(screen.getByText("bare content")).toBeInTheDocument();
    expect(screen.queryByText("t")).not.toBeInTheDocument();
  });
});
