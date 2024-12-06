import React from 'react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Manage Your Tasks Efficiently with To-Do App</h1>
        <p className="text-lg mb-6">
          The ultimate tool for organizing tasks, planning, and achieving your daily goals.
        </p>
        <Link to="/login">
          <button className="bg-white text-blue-500 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-gray-100">
            Get Started Now
          </button>
        </Link>
      </div>
    </div>
  );
}
