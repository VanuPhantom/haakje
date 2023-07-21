import { act, renderHook } from "@testing-library/react";
import { useTime } from ".";
import { sleep } from "./utils/time";

test("useTime ticks", async () => {
  const { result } = renderHook(() => useTime("second"));

  for (let i = 0; i < 10; i++) {
    const startTime = result.current.toSeconds();

    await act(() => sleep(1000));

    const endTime = result.current.toSeconds();

    expect(endTime - startTime).toBe(1);
  }
}, 10500);
