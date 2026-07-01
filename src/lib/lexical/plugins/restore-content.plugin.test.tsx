import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

const { editorMock } = vi.hoisted(() => ({
  editorMock: {
    parseEditorState: vi.fn(),
    setEditorState: vi.fn(),
  },
}));

vi.mock("@lexical/react/LexicalComposerContext", () => ({
  useLexicalComposerContext: () => [editorMock],
}));

import { RestoreContentPlugin } from "./restore-content.plugin";

describe("RestoreContentPlugin", () => {
  beforeEach(() => {
    editorMock.parseEditorState.mockReset();
    editorMock.setEditorState.mockReset();
  });

  it("returns null", () => {
    editorMock.parseEditorState.mockReturnValue({});
    const { container } = render(<RestoreContentPlugin content="" />);
    expect(container.firstChild).toBeNull();
  });

  it("does nothing when content is empty", () => {
    render(<RestoreContentPlugin content="" />);
    expect(editorMock.parseEditorState).not.toHaveBeenCalled();
    expect(editorMock.setEditorState).not.toHaveBeenCalled();
  });

  it("parses and applies the editor state for valid content", () => {
    const parsedState = { kind: "parsed" };
    editorMock.parseEditorState.mockReturnValue(parsedState);
    render(<RestoreContentPlugin content='{"root":{"children":[]}}' />);
    expect(editorMock.parseEditorState).toHaveBeenCalledWith(
      '{"root":{"children":[]}}',
    );
    expect(editorMock.setEditorState).toHaveBeenCalledWith(parsedState);
  });

  it("silently ignores parse errors", () => {
    editorMock.parseEditorState.mockImplementation(() => {
      throw new Error("invalid");
    });
    expect(() =>
      render(<RestoreContentPlugin content="not-json" />),
    ).not.toThrow();
    expect(editorMock.setEditorState).not.toHaveBeenCalled();
  });

  it("only restores once even when re-rendered with the same content", () => {
    editorMock.parseEditorState.mockReturnValue({});
    const { rerender } = render(<RestoreContentPlugin content='{"root":{}}' />);
    expect(editorMock.setEditorState).toHaveBeenCalledTimes(1);
    rerender(<RestoreContentPlugin content='{"root":{}}' />);
    expect(editorMock.setEditorState).toHaveBeenCalledTimes(1);
  });
});
