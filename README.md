> **Haakje**  
> Dutch for "Little hook"

# TLDR

_Haakje_ is a library containing little hooks to make building React apps easier.

# Docs

## `useTime`

`useTime` provides you with the current time as a Luxon `DateTime` object. It provides you with the start of the current time at the granularity you request.

```jsx
import { useTime } from "haakje";

export default function App() {
  const timeString = useTime("second").toISO();

  return <span>{timeString}</span>;
}
```

## `useBehaviorSubjectValue`

`useBehaviorSubjectValue` provides you with a behavior subject's current value.

```javascript
import { useBehaviorSubjectValue } from "haakje";
import { BehaviorSubject } from "rxjs";

const name$ = new BehaviorSubject("Tess");

function useName() {
  return useBehaviorSubjectValue(name$);
}

function Greeting() {
  const name = useName();

  return <span>Hello, {name || "world"}!</span>;
}

function NameInput() {
  const name = useName();

  return (
    <input
      type="text"
      value={name}
      onChange={(e) => name$.next(e.target.value)}
    />
  );
}

export default function App() {
  return (
    <div>
      <NameInput />
      <Greeting />
    </div>
  );
}
```

## `useLatestEmissionFromObservable`

`useLatestEmissionFromObservable` provides you with an observable's latest emission.

**Please note:** If you're using an observable which doesn't immediately emit a value, you'll need to pass in an initial value through the second parameter.

### Example with an observable which immediately emits a value

```javascript
import { useLatestEmissionFromObservable } from "haakje";
import { Observable } from "rxjs";

const $randomNumberEverySecond = new Observable((subscriber) => {
  const emit = () => subscriber.next(Math.random());

  emit();

  setInterval(emit, 1000);
});

function RandomNumber() {
  return <div>{useLatestEmissionFromObservable($randomNumberEverySecond)}</div>;
}

export default function App() {
  return (
    <div>
      <h1>Random numbers</h1>
      <RandomNumber />
      <RandomNumber />
    </div>
  );
}
```

### Example with an observable which doesn't immediately emit a value

```javascript
import { useLatestEmissionFromObservable } from "haakje";
import { DateTime } from "luxon";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";

const $ping = new Subject();
const $pingTime = $ping.pipe(map(() => DateTime.now().toISO()));

export default function App() {
  const lastPingedAt = useLatestEmissionFromObservable($pingTime, [undefined]);

  return (
    <div>
      <span>
        {lastPingedAt === undefined
          ? "You've never been pinged!"
          : lastPingedAt}
      </span>
      <button onClick={() => $ping.next()}>Ping!</button>
    </div>
  );
}
```

## `useReferentiallyStableMemo`

`useReferentiallyStableMemo` works exactly like React's `useMemo`, but it won't "forget" the results. This makes it referentially stable.

```javascript
import { useReferentiallyStableMemo } from "haakje";
import { useEffect, useState } from "react";

export default function App() {
  const [name, setName] = useState("Tess");
  const [occupation, setOccupation] = useState("Software engineer");
  const person = useReferentiallyStableMemo(
    () => ({
      name,
      occupation,
    }),
    [name, occupation]
  );

  useEffect(() => console.debug(person), [person]);

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        value={occupation}
        onChange={(e) => setOccupation(e.target.value)}
      />
    </div>
  );
}
```
