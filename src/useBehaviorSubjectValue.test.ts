import { renderHook } from "@testing-library/react";
import { BehaviorSubject } from "rxjs";
import { useBehaviorSubjectValue } from ".";

describe("useBehaviorSubjectValue", () => {
  const FIRST = Symbol(),
    SECOND = Symbol();
  const behaviorSubject = new BehaviorSubject<typeof FIRST | typeof SECOND>(
    FIRST
  );

  beforeEach(() => behaviorSubject.next(FIRST));

  test("returns the current value", () => {
    const { result } = renderHook(() =>
      useBehaviorSubjectValue(behaviorSubject)
    );

    expect(result.current).toBe(FIRST);
  });

  test("returns the current value followed by the next emission", () => {
    const { result, rerender } = renderHook(() =>
      useBehaviorSubjectValue(behaviorSubject)
    );

    expect(result.current).toBe(FIRST);

    behaviorSubject.next(SECOND);
    rerender();

    expect(result.current).toBe(SECOND);
  });
});
