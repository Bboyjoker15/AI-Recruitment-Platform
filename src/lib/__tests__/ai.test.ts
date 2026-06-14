import { describe, it, expect } from "vitest";
import { parseAIScore } from "@/lib/ai";

describe("parseAIScore", () => {
  const validInput = {
    summary: "Candidato con experiencia en React y Node.js.",
    classification: "Senior Frontend",
    suggestions: ["Destacar logros cuantificables", "Incluir proyectos open-source"],
    risk_level: "low",
    score: 85,
    suggested_next_step: "interview",
  };

  it("parsea un JSON válido correctamente", () => {
    const result = parseAIScore(JSON.stringify(validInput));
    expect(result).toEqual(validInput);
  });

  it("limpia wrappers de markdown antes de parsear", () => {
    const wrapped = "```json\n" + JSON.stringify(validInput) + "\n```";
    const result = parseAIScore(wrapped);
    expect(result.score).toBe(85);
  });

  it("limpia wrappers sin language tag", () => {
    const wrapped = "```\n" + JSON.stringify(validInput) + "\n```";
    const result = parseAIScore(wrapped);
    expect(result.classification).toBe("Senior Frontend");
  });

  it("acepta score = 0 como válido", () => {
    const result = parseAIScore(JSON.stringify({ ...validInput, score: 0 }));
    expect(result.score).toBe(0);
  });

  it("acepta score = 100 como válido", () => {
    const result = parseAIScore(JSON.stringify({ ...validInput, score: 100 }));
    expect(result.score).toBe(100);
  });

  it("lanza error si el JSON es inválido", () => {
    expect(() => parseAIScore("no es json")).toThrow("La IA devolvió un JSON inválido.");
  });

  it("lanza error si el resultado no es un objeto", () => {
    expect(() => parseAIScore('"string"')).toThrow("formato inesperado");
  });

  it("lanza error si es un array", () => {
    expect(() => parseAIScore("[]")).toThrow("formato inesperado");
  });

  it("lanza error si summary falta", () => {
    expect(() =>
      parseAIScore(JSON.stringify({ ...validInput, summary: "" }))
    ).toThrow("summary");
  });

  it("lanza error si classification no es string", () => {
    expect(() =>
      parseAIScore(JSON.stringify({ ...validInput, classification: 123 }))
    ).toThrow("classification");
  });

  it("lanza error si suggestions no es array", () => {
    expect(() =>
      parseAIScore(JSON.stringify({ ...validInput, suggestions: "no array" }))
    ).toThrow("suggestions");
  });

  it("lanza error si risk_level es inválido", () => {
    expect(() =>
      parseAIScore(JSON.stringify({ ...validInput, risk_level: "critical" }))
    ).toThrow("risk_level");
  });

  it("lanza error si score es negativo", () => {
    expect(() =>
      parseAIScore(JSON.stringify({ ...validInput, score: -1 }))
    ).toThrow("score' debe ser un número entre 0 y 100");
  });

  it("lanza error si score es mayor a 100", () => {
    expect(() =>
      parseAIScore(JSON.stringify({ ...validInput, score: 101 }))
    ).toThrow("score' debe ser un número entre 0 y 100");
  });

  it("lanza error si suggested_next_step está vacío", () => {
    expect(() =>
      parseAIScore(JSON.stringify({ ...validInput, suggested_next_step: "" }))
    ).toThrow("suggested_next_step");
  });
});
