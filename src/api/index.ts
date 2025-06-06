import express from 'express';

const apiRoutes = express.Router();


apiRoutes.get('/healthCheck', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

export { apiRoutes };
