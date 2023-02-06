import { DateTime, DateTimeUnit } from "luxon";
import { useEffect, useRef, useState } from "react";
import {
  BehaviorSubject,
  distinctUntilChanged,
  first,
  interval,
  map,
  Observable,
  partition,
  skip,
  Subscription,
} from "rxjs";

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

export function useObservable<T>(
  observable: Observable<T>,
  initialValue?: T
): T {
  const argumentCount = arguments.length;
  const remainderRef = useRef<Observable<T>>();

  const [value, setValue] = useState(() => {
    if (argumentCount > 1) return initialValue as T;
    else {
      let firstEmissionSet: boolean = false;
      let firstEmission: T;

      const [first$, remainder$] = partition(
        observable,
        (_, index) => index === 0
      );

      remainderRef.current = remainder$;

      first$
        .subscribe((x) => {
          firstEmissionSet = true;
          firstEmission = x;
        })
        .unsubscribe();

      if (!firstEmissionSet)
        throw new Error(
          "The observable you provided didn't immediately emit a value! " +
            "Did you forget to use startWith or to provide an initialValue when calling useObservable?"
        );
      else return firstEmission!;
    }
  });

  const isFirstRunRef = useRef(true);

  useEffect(() => {
    const subscription =
      argumentCount > 1 || !isFirstRunRef.current
        ? observable.subscribe(setValue)
        : remainderRef.current!.subscribe(setValue);

    isFirstRunRef.current = false;

    return () => subscription.unsubscribe();
  }, [observable]);

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
