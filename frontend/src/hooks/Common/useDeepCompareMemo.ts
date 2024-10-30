import { useMemo, useRef } from 'react';
import isEqual from 'react-fast-compare';

function useDeepCompareMemoize(value: any) {
  const ref = useRef();
  // it can be done by using useMemo as well
  // but useRef is rather cleaner and easier

  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

export function useDeepCompareMemo<T>(
  callback: () => T,
  dependencies: React.DependencyList | undefined,
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo<T>(callback, dependencies?.map(useDeepCompareMemoize) as any);
}
