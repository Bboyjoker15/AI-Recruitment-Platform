import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/shared/ui/Button";

describe("Button", () => {
  it("renderiza el texto del children", () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
  });

  it("aplica disabled cuando se pasa la prop", () => {
    render(<Button disabled>Deshabilitado</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("no llama onClick cuando está disabled", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("llama onClick al hacer click", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("deshabilita el botón cuando loading es true", () => {
    render(<Button loading>Procesar</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("muestra spinner SVG cuando loading es true", () => {
    const { container } = render(<Button loading>Procesar</Button>);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("aplica className adicional", () => {
    render(<Button className="extra-class">Test</Button>);
    expect(screen.getByRole("button")).toHaveClass("extra-class");
  });
});
