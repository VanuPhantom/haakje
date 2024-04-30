import { act, renderHook } from "@testing-library/react";
import { DateTime, Settings } from "luxon";
import { Observable, Subject } from "rxjs";
import { useLatestEmissionFromObservable, useTime } from ".";
import { sleep } from "./utils/time";

test("useTime ticks", async () => {
  let now = 0;
  Settings.now = () => now;
  await sleep(1000);

  const { result } = renderHook(() => useTime("second"));

  for (let i = 0; i < 5; i++) {
    const startTime = result.current.toSeconds();

    await act(async () => {
      console.info(DateTime.now().toSeconds());
      now += 1000;
      await sleep(1000);
      console.info(DateTime.now().toSeconds());
    });

    const endTime = result.current.toSeconds();

    expect(endTime - startTime).toBe(1);
  }
}, 8000);

describe("useLatestEmissionFromObservable", () => {
  describe("when the observable does not immediately emit", () => {
    const observable = new Subject();

    test("throws an error when not provided with a default value", () => {
      expect(() =>
        renderHook(() => useLatestEmissionFromObservable(observable))
      ).toThrow(
        "The observable you provided didn't immediately emit a value! Did you forget to use startWith or to provide an initialValue when calling useLatestEmissionFromObservable?"
      );
    });

    test("returns the default value", () => {
      const UNIQUE = Symbol();

      const { result } = renderHook(() =>
        useLatestEmissionFromObservable(observable, [UNIQUE])
      );

      expect(result.current).toBe(UNIQUE);
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
