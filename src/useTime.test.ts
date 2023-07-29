import { act, renderHook } from "@testing-library/react";
import { DateTime, Settings } from "luxon";
import { usePromise, useTime } from ".";
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

describe("usePromise", () => {
  const fixture = (() => {
    let promise: Promise<string>,
      resolve: (result: string) => void,
      reject: (error: any) => void;

    function resetPromise() {
      promise = new Promise((resolveInternal, rejectInternal) => {
        resolve = resolveInternal;
        reject = rejectInternal;
      });
    }

    beforeEach(resetPromise);

    return {
      get promise() {
        return promise;
      },
      get resolve() {
        return resolve;
      },
      get reject() {
        return reject;
      },
    };
  })();

  test("calls the then and finally callbacks", () => {
    const expectedResult = "test";
    const thenCallback = jest.fn(),
      finallyCallback = jest.fn();

    renderHook(() =>
      usePromise(fixture.promise, {
        then: thenCallback,
        finally: finallyCallback,
      })
    );

    expect(thenCallback).toHaveBeenCalledTimes(0);
    expect(finallyCallback).toHaveBeenCalledTimes(0);

    fixture.resolve(expectedResult);

    expect(thenCallback).toHaveBeenCalledTimes(1);
    expect(thenCallback).toHaveBeenCalledWith(expectedResult);
    expect(finallyCallback).toHaveBeenCalledTimes(1);
  });

  test("calls the catch and finally callbacks", () => {
    const expectedError = new Error("A fake error occurred!");
    const catchCallback = jest.fn(),
      finallyCallback = jest.fn();

    renderHook(() =>
      usePromise(fixture.promise, {
        catch: catchCallback,
        finally: finallyCallback,
      })
    );

    expect(catchCallback).toHaveBeenCalledTimes(0);
    expect(finallyCallback).toHaveBeenCalledTimes(0);

    fixture.reject(expectedError);

    expect(catchCallback).toHaveBeenCalledTimes(1);
    expect(catchCallback).toHaveBeenCalledWith(expectedError);
    expect(finallyCallback).toHaveBeenCalledTimes(1);
  });
});
