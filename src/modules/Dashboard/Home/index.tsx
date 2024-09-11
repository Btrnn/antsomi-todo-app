// Libraries
import React, { useState } from "react";

// Components
import { Button } from "components/ui";

// Hooks
import { useCounter } from "hooks";

interface HomeProps {}

export const Home: React.FC<HomeProps> = (props) => {
  const { ...restProps } = props;
  const [step, setStep] = useState(1);

  const { count, setCount, increment, decrement, reset } = useCounter(0, step);

  const multiplyBy2 = () => {
    setCount((x: number) => x * 2);
  };

  return (
    <main className="p-6">
      <p>Count is {count}</p>
      <input onChange={(e) => setStep(+e.target.value)} />
      <div className="flex items-center gap-2">
        <button onClick={increment}>Increment</button>
        <button onClick={decrement}>Decrement</button>
        <button onClick={reset}>Reset</button>
        <button onClick={multiplyBy2}>Multiply by 2</button>
      </div>

      <h2 className="text-xl font-bold mb-4">Overview</h2>

      {/* Dashboard content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-2.5">
        {/* Example Card 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Card 1</h3>
          <p className="mt-2 text-gray-600">
            Some information about this card.
          </p>
        </div>

        {/* Example Card 2 */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Card 2</h3>
          <p className="mt-2 text-gray-600">
            Some information about this card.
          </p>
        </div>

        {/* Example Card 3 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Card 3</h3>
          <p className="mt-2 text-gray-600">
            Some information about this card.
          </p>
        </div>
      </div>

      <Button>Hello world</Button>
    </main>
  );
};
