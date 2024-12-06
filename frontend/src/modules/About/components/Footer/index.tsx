import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto text-center">
        <p className="text-sm">© 2024 To-Do App. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-4">
          <a href="#" className="text-gray-400 hover:text-white">
            Chính sách bảo mật
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            Điều khoản sử dụng
          </a>
        </div>
      </div>
    </footer>
  );
}
