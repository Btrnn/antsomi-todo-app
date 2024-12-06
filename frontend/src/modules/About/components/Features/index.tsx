import React from 'react';

const features = [
  {
    title: 'Easy to Use',
    description: 'A user-friendly interface for everyone.',
    icon: '📝',
  },
  {
    title: 'Organized Effectively',
    description: 'Categorize and prioritize tasks with ease.',
    icon: '📂',
  },
  {
    title: 'Smart Reminders',
    description: 'Never miss a task with our reminder feature.',
    icon: '⏰',
  },
];

export function Features() {
  return (
    <div className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
