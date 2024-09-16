// Libraries
import { useCallback, useState } from "react";

// Types
import type { Dispatch, SetStateAction } from "react";

type UseCounterReturn = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: Dispatch<SetStateAction<number>>;
};

export function useCounter(initialValue?: number,step: number = 1): UseCounterReturn {
  const [count, setCount] = useState(initialValue ?? 0);

  const increment = useCallback(() => {
    setCount((x) => x + (step ?? 1));
  }, [step]);

  const decrement = useCallback(() => {
    setCount((x) => x - (step ?? -1));
  }, [step]);

  const reset = useCallback(() => {
    setCount(initialValue ?? 0);
  }, [initialValue]);

  return {
    count,
    increment,
    decrement,
    reset,
    setCount,
  };
}
