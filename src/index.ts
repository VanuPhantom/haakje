import { DateTime, DateTimeUnit } from "luxon";
import { useSyncExternalStore } from "react";
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
 * Please note that this hook doesn't support changing the behavior subject after the first call
 * @template T The value's type
 * @param behaviorSubject The behavior subject from which to get the value
 * @returns The behavior subject's current value
 */
export function useBehaviorSubjectValue<T>(
  behaviorSubject: BehaviorSubject<T>
): T {
  return useSyncExternalStore(
    (onStoreChange) => {
      const subscription = behaviorSubject.subscribe(onStoreChange);

      return () => subscription.unsubscribe();
    },
    () => behaviorSubject.value
  );
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
