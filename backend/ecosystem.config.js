module.exports = {
  apps: [
    {
      name: 'todo-backend',
      script: './dist/main.js',
      exec_mode: 'fork',
    },
  ],
};
