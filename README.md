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
