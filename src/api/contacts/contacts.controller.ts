import { Request, Response } from 'express';
import { ContactPayload } from './contacts.interface';
import { ContactsService } from './contacts.service';

export class ContactsController {

    private contactsService: ContactsService;

    constructor() {
        this.contactsService = new ContactsService();
    }


    public async getContacts(req: Request, res: Response) {
        try {
            const contacts = [];
            res.status(200).json(contacts);
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve contacts' });
        }
    }

    public async identifyContact(req: Request, res: Response) {
        try {
            const { email } = req.query;
            // Logic to identify contact by email
            if (!email) {
                res.status(400).json({ error: 'Email query parameter is required' });
            }
            // Replace with actual identification logic
            const contact = { email }; // Mock contact data
            res.status(200).json(contact);
        } catch (error) {
            res.status(500).json({ error: 'Failed to identify contact' });
        }
    }

    public async createContact(
        req: Request<unknown, unknown, ContactPayload, unknown>,
        res: Response
    ) {
        try {
            console.log('Received request to create contact:', req.body);
            const ContactPayload: ContactPayload = req.body;
            // Validate the request body
            if (!ContactPayload.email || !ContactPayload.phoneNumber) {
                return res.status(400).json({ error: 'Email and phone number are required' });
            }
            // Logic to save the contact to the database or service
            const contact = await this.contactsService.createContact(ContactPayload);

            console.log('Contact created successfully:', contact);
            return res.status(201).json({ message: 'Contact created', contact });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create contact' });
        }
    }
}