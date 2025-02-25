import React from "react";
import { Subject, scan } from "rxjs";
import { useLatestEmissionFromObservable } from "haakje";

const $increment = new Subject<void>();

function increment() {
  $increment.next();
}

const $counter = $increment.pipe(scan((accumulator) => accumulator + 1, 0));

export default function Counter() {
  const count = useLatestEmissionFromObservable($counter);

  return <button onClick={increment}>Times clicked: {count}</button>;
}
