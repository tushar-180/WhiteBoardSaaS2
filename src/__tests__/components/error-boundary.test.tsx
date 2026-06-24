import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "@/components/shared/error-boundary";

const ThrowError = ({ message }: { message: string }) => { throw new Error(message); };
const GoodComponent = () => <div>Everything is fine</div>;

describe("ErrorBoundary", () => {
  beforeEach(() => { vi.spyOn(console, "error").mockImplementation(() => {}); });
  afterEach(() => { vi.restoreAllMocks(); });

  it("renders children when there is no error", () => {
    render(<ErrorBoundary><GoodComponent /></ErrorBoundary>);
    expect(screen.getByText("Everything is fine")).toBeDefined();
  });

  it("renders fallback UI when a child throws", () => {
    render(<ErrorBoundary><ThrowError message="crash" /></ErrorBoundary>);
    expect(screen.getByText("Something went wrong")).toBeDefined();
  });

  it("recovers after clicking Try again", () => {
    const { rerender } = render(<ErrorBoundary key="b1"><ThrowError message="crash" /></ErrorBoundary>);
    fireEvent.click(screen.getByText("Try again"));
    rerender(<ErrorBoundary key="b2"><GoodComponent /></ErrorBoundary>);
    expect(screen.getByText("Everything is fine")).toBeDefined();
  });
});
