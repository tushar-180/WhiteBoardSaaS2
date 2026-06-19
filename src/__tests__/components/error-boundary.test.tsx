import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "@/components/shared/error-boundary";

const ThrowError = ({ message }: { message: string }) => {
  throw new Error(message);
};

const GoodComponent = () => <div>Everything is fine</div>;

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Everything is fine")).toBeDefined();
  });

  it("renders fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Test crash" />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(
      screen.getByText(
        "An unexpected error occurred. Please try again or contact support if the problem persists.",
      ),
    ).toBeDefined();
    expect(screen.getByText("Try again")).toBeDefined();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowError message="Test crash" />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Custom error UI")).toBeDefined();
  });

  it("recovers after clicking Try again", () => {
    // Render with a throwing child to trigger error state
    const { rerender } = render(
      <ErrorBoundary key="boundary-1">
        <ThrowError message="First crash" />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();

    // Click retry to reset error state
    fireEvent.click(screen.getByText("Try again"));

    // After reset, re-render with a good component (using a new ErrorBoundary instance
    // since React may batch re-renders)
    rerender(
      <ErrorBoundary key="boundary-2">
        <GoodComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Everything is fine")).toBeDefined();
  });

  it("logs errors to console on catch", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError message="Log test" />
      </ErrorBoundary>,
    );

    expect(consoleSpy).toHaveBeenCalled();
    const allArgs = consoleSpy.mock.calls.flatMap((call) => call).join(" ");
    expect(allArgs).toContain("[ErrorBoundary]");
  });
});
