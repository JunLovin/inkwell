import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field } from "./Field";

describe("Field", () => {
  it("renders the label and children", () => {
    render(
      <Field label="Email">
        <input data-testid="i" />
      </Field>,
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByTestId("i")).toBeInTheDocument();
  });

  it("renders the action when provided", () => {
    render(
      <Field label="Email" action={<button>Forgot?</button>}>
        <input />
      </Field>,
    );
    expect(screen.getByText("Forgot?")).toBeInTheDocument();
  });

  it("renders the error message when provided", () => {
    render(
      <Field label="x" error="Bad">
        <input />
      </Field>,
    );
    expect(screen.getByText("Bad")).toBeInTheDocument();
  });

  it("does not render error paragraph when error is empty", () => {
    render(
      <Field label="x">
        <input />
      </Field>,
    );
    expect(document.querySelector("p")).toBeNull();
  });
});
