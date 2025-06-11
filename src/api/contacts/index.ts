import express from "express";

const contactsRoutes = express.Router();

contactsRoutes.get("/", (req, res) => {
  res.status(200).json({ message: "Contacts endpoint is working" });
});

export default contactsRoutes;
