import express from 'express';

const app = express();

// Pre-route middleware

// Routes

// Post-route middleware

const main = () => {
  app.listen(10000, () => {
    console.log(`Server @ port ${10000}`);
  });
};

export default { main, app };
