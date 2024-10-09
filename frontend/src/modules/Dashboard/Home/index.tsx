// Libraries
import React from 'react';

// Components
import { Button } from 'components/ui';

export const Home: React.FC = () => {
  return (
    <main className="p-6">
      <h2 className="text-xl font-bold mb-4">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-2.5">
        {/* Example Card 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Task Remaining</h3>
          <p className="mt-2 text-gray-600">Some information about this card.</p>
        </div>

        {/* Example Card 2 */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Task completed</h3>
          <p className="mt-2 text-gray-600">Some information about this card.</p>
        </div>

        {/* Example Card 3 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Card 3</h3>
          <p className="mt-2 text-gray-600">Some information about this card.</p>
        </div>
      </div>
    </main>
  );
};
