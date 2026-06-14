import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApplySuccess } from "@/components/apply/ApplySuccess";

describe("ApplySuccess", () => {
  it("muestra el score", () => {
    render(<ApplySuccess score={85} classification="Senior Frontend" />);
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("muestra la classification", () => {
    render(<ApplySuccess score={85} classification="Senior Frontend" />);
    expect(screen.getByText("Senior Frontend")).toBeInTheDocument();
  });

  it("muestra el título de confirmación", () => {
    render(<ApplySuccess score={85} classification="Senior Frontend" />);
    expect(screen.getByText("¡Postulación recibida!")).toBeInTheDocument();
  });

  it("usa color verde para score >= 75", () => {
    render(<ApplySuccess score={75} classification="Senior" />);
    expect(screen.getByText("75")).toHaveClass("text-green-600");
  });

  it("usa color amarillo para score entre 50 y 74", () => {
    render(<ApplySuccess score={62} classification="Junior" />);
    expect(screen.getByText("62")).toHaveClass("text-yellow-600");
  });

  it("usa color rojo para score < 50", () => {
    render(<ApplySuccess score={30} classification="No apto" />);
    expect(screen.getByText("30")).toHaveClass("text-red-600");
  });

  it("muestra el icono de check", () => {
    const { container } = render(<ApplySuccess score={85} classification="Senior" />);
    const svgs = container.querySelectorAll("svg");
    const checkSvg = Array.from(svgs).find((s) =>
      s.innerHTML.includes("M4.5 12.75l6 6 9-13.5")
    );
    expect(checkSvg).toBeInTheDocument();
  });
});
