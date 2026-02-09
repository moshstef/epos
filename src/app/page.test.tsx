import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "./page";

test("renders the EPOS heading", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { level: 1, name: "EPOS" })
  ).toBeInTheDocument();
});

test("renders a Start Learning link", () => {
  render(<Home />);
  const links = screen.getAllByRole("link", { name: "Start Learning" });
  expect(links[0]).toHaveAttribute("href", "/lessons");
});
