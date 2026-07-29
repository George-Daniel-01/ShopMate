import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CategoryGrid from "../components/Home/CategoryGrid";

describe("CategoryGrid", () => {
  it("renders the shop by category heading", () => {
    render(
      <BrowserRouter>
        <CategoryGrid />
      </BrowserRouter>
    );
    expect(screen.getByText("Shop by Category")).toBeInTheDocument();
  });

  it("renders category links", () => {
    render(
      <BrowserRouter>
        <CategoryGrid />
      </BrowserRouter>
    );
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});