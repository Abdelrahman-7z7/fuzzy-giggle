// src/app.ts
import express from 'express';
import globalErrorHandler from './controller/errorController';
import morgan from 'morgan';

//Routes
import productRoute from './Routes/productRoutes'



const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Middleware
app.use(express.json());

// Routes

app.use('/api/k1/products', productRoute)

app.get('/', (_req, res) => {
  res.json({ message: 'Hello, World!' });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
