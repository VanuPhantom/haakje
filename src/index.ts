import { DateTime, DateTimeUnit } from "luxon";
import { useEffect, useState } from "react";
import { BehaviorSubject, distinctUntilChanged, interval, map } from "rxjs";

const $second = (() => {
  const $secondInternal = new BehaviorSubject<DateTime>(
    DateTime.now().startOf("second")
  );

  interval(1000)
    .pipe(map(() => DateTime.now().startOf("second")))
    .subscribe($secondInternal);

  return $secondInternal;
})();

function deriveTimeObservable(
  source: BehaviorSubject<DateTime>,
  unit: DateTimeUnit
): BehaviorSubject<DateTime> {
  const derived = new BehaviorSubject<DateTime>(source.value.startOf(unit));

  source
    .pipe(
      distinctUntilChanged((previous, current) =>
        previous.hasSame(current, unit)
      ),
      map((time) => time.startOf(unit))
    )
    .subscribe(derived);

  return derived;
}

const $minute = deriveTimeObservable($second, "minute");
const $hour = deriveTimeObservable($minute, "hour");
const $day = deriveTimeObservable($hour, "day");
const $week = deriveTimeObservable($day, "week");

/**
 * Provides you with a behavior subject's current value.
 * @template T The value's type
 * @param behaviorSubject The behavior subject from which to get the value
 * @returns The behavior subject's current value
 */
export function useBehaviorSubjectValue<T>(
  behaviorSubject: BehaviorSubject<T>
): T {
  const [value, setValue] = useState<T>(() => behaviorSubject.value);

  useEffect(() => {
    const subscription = behaviorSubject.subscribe(setValue);

    return () => subscription.unsubscribe();
  }, [behaviorSubject]);

  return value;
}

export function useTime(unit: "second" | "minute" | "hour" | "day" | "week") {
  return useBehaviorSubjectValue(
    {
      second: $second,
      minute: $minute,
      hour: $hour,
      day: $day,
      week: $week,
    }[unit]
  );
}
