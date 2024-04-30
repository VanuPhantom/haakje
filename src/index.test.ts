import { act, renderHook } from "@testing-library/react";
import { DateTime, Settings } from "luxon";
import { Subject } from "rxjs";
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
});
