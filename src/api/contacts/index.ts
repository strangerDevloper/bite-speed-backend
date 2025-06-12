import express from "express";
import { ContactsController } from "./contacts.controller";

const contactsRoutes = express.Router();

const contactsController = new ContactsController();

// Define the routes for contacts
contactsRoutes.get("/", (req, res) => {
    res.status(200).json({ message: "Contacts endpoint is working" });
});

contactsRoutes.get("/all", contactsController.getContacts.bind(contactsController));
contactsRoutes.post("/identify", contactsController.identifyContact.bind(contactsController));
contactsRoutes.post("/", contactsController.createContact.bind(contactsController));

export default contactsRoutes;
