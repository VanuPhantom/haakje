import { act, renderHook } from "@testing-library/react";
import { DateTime, Settings } from "luxon";
import { useTime } from ".";
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
