import { useRef } from 'rax';

export default function useCreation<T>(factory: () => T) {
  const { current } = useRef({
    initialized: false,
    result: undefined,
  });
  if (!current.initialized) {
    current.initialized = true;
    current.result = factory();
  }

  return current.result as T;
}
