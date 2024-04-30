import { renderHook } from "@testing-library/react";
import { Observable, Subject } from "rxjs";
import { useLatestEmissionFromObservable } from ".";

describe("useLatestEmissionFromObservable", () => {
  describe("when the observable does not immediately emit", () => {
    const DEFAULT = Symbol(),
      EMISSION = Symbol();
    const observable = new Subject<typeof EMISSION>();

    test("throws an error when not provided with a default value", () => {
      expect(() =>
        renderHook(() => useLatestEmissionFromObservable(observable))
      ).toThrow(
        "The observable you provided didn't immediately emit a value! Did you forget to use startWith or to provide an initialValue when calling useLatestEmissionFromObservable?"
      );
    });

    test("returns the default value", () => {
      const { result } = renderHook(() =>
        useLatestEmissionFromObservable<typeof DEFAULT | typeof EMISSION>(
          observable,
          [DEFAULT]
        )
      );

      expect(result.current).toBe(DEFAULT);
    });

    describe("and emits later", () => {
      test("returns the default value followed by the emission", () => {
        const { result, rerender } = renderHook(() =>
          useLatestEmissionFromObservable<typeof DEFAULT | typeof EMISSION>(
            observable,
            [DEFAULT]
          )
        );

        expect(result.current).toBe(DEFAULT);

        observable.next(EMISSION);
        rerender();

        expect(result.current).toBe(EMISSION);
      });
    });
  });

  describe("when the observable immediately emits", () => {
    const DEFAULT = Symbol(),
      EMISSION = Symbol();

    const observable = new Observable<typeof EMISSION>((subscriber) => {
      subscriber.next(EMISSION);
      subscriber.complete();
    });

    test("returns the first emission", () => {
      const { result } = renderHook(() =>
        useLatestEmissionFromObservable(observable)
      );

      expect(result.current).toBe(EMISSION);
    });

    test("does not return the default value", () => {
      const { result } = renderHook(() =>
        useLatestEmissionFromObservable<typeof EMISSION | typeof DEFAULT>(
          observable,
          [DEFAULT]
        )
      );

      expect(result.current).not.toBe(DEFAULT);
    });

    describe("followed by another emission", () => {
      const SECOND_EMISSION = Symbol();

      const observable = new (class ImmediateTestObservable extends Observable<
        typeof EMISSION | typeof SECOND_EMISSION
      > {
        private readonly listeners: Set<() => void>;

        public constructor() {
          super((subscriber) => {
            subscriber.next(EMISSION);

            const listener = () => {
              subscriber.next(SECOND_EMISSION);
              subscriber.complete();
            };

            this.listeners.add(listener);

            return () => this.listeners.delete(listener);
          });

          this.listeners = new Set();
        }

        public next() {
          this.listeners.forEach((item) => item());
        }
      })();

      test("returns the first emission followed by the second emission", async () => {
        const { result, rerender } = renderHook(() =>
          useLatestEmissionFromObservable(observable)
        );

        expect(result.current).toBe(EMISSION);

        observable.next();
        rerender();

        expect(result.current).toBe(SECOND_EMISSION);
      });
    });
  });
});
