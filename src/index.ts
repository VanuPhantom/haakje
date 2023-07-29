import { DateTime, DateTimeUnit } from "luxon";
import { useEffect, useRef, useState } from "react";
import {
  BehaviorSubject,
  distinctUntilChanged,
  interval,
  map,
  Observable,
  of,
  partition,
} from "rxjs";
import { referentiallyCompareArrayItems } from "./util";

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

const EMPTY_PARAMETER = Symbol();

/**
 * Provides you with an observable's latest emission
 * @param observable The observable whose latest emission to return
 * @param initialValue The value to return before the first emission
 * @returns The observable's latest emission, or initalValue if the observable hasn't emitted yet
 */
export function useLatestEmissionFromObservable<T>(
  observable: Observable<T>,
  [initialValue]: [T | typeof EMPTY_PARAMETER] = [EMPTY_PARAMETER]
): T {
  const remainderRef = useRef<Observable<T>>();

  const [value, setValue] = useState(() => {
    if (initialValue !== EMPTY_PARAMETER) return initialValue;
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
            "Did you forget to use startWith or to provide an initialValue " +
            "when calling useLatestEmissionFromObservable?"
        );
      else return firstEmission!;
    }
  });

  const isFirstRunRef = useRef(true);

  useEffect(() => {
    const subscription =
      initialValue !== EMPTY_PARAMETER || !isFirstRunRef.current
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

/**
 * Does exactly the same as useMemo, but guarantees referential stability
 * @param compute A function which returns the memo's value
 * @param dependencies An array of values which are used to determine the memo's value
 * @returns The return value of the function you provide
 */
export function useReferentiallyStableMemo<T>(
  compute: () => T,
  dependencies: unknown[]
): T {
  const valueRef = useRef<T>();
  const dependencyRef = useRef<unknown[]>();

  const getValue = () => (valueRef.current ??= compute());

  if (
    dependencyRef.current === undefined ||
    !referentiallyCompareArrayItems(dependencyRef.current, dependencies)
  ) {
    dependencyRef.current = dependencies;

    return (valueRef.current = compute());
  }

  return getValue();
}

export declare function usePromise<T>(
  promise: Promise<T>,
  callbacks: {
    then?(result: T): void;
    catch?(error: any): void;
    finally?(): void;
  }
): void;
