import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BackButton } from "@/components/shared/ui/BackButton";

describe("BackButton", () => {
  it("renderiza un link con el href correcto", () => {
    render(<BackButton href="/jobs" label="Volver a vacantes" />);
    const link = screen.getByRole("link", { name: /volver a vacantes/i });
    expect(link).toHaveAttribute("href", "/jobs");
  });

  it("renderiza el label como texto visible", () => {
    render(<BackButton href="/candidates" label="Volver al candidato" />);
    expect(screen.getByText("Volver al candidato")).toBeInTheDocument();
  });

  it("contiene el SVG del icono de flecha", () => {
    const { container } = render(<BackButton href="/" label="Volver" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });
});
