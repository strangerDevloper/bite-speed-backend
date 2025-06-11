import express from 'express';
import contactsRoutes from './contacts';

const apiRoutes = express.Router();


apiRoutes.use('/contacts', contactsRoutes);

apiRoutes.get('/healthCheck', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

export { apiRoutes };
