import { getRepository } from "typeorm";
import { Contact } from "../../entities/Contacts";
import { ContactPayload } from "./contacts.interface";
import { LinkPrecedence } from "../../entities/types";

export class ContactsService {
    public async createContact(contactPayload: ContactPayload): Promise<Contact> {
        try {            
            const contactRepo = getRepository(Contact);

            const matchingContacts = await this.findAllMatchingContacts(contactRepo, contactPayload);

            let contactToSave: Contact | null = null;

            if (matchingContacts.length === 0) {
                contactToSave = this.createPrimaryContact(contactPayload);
            } else if (this.shouldMergeContacts(matchingContacts, contactPayload)) {
                contactToSave = await this.handleMergeContacts(matchingContacts, contactPayload);
            } else {
                const existingContact = matchingContacts[0];
                if (
                    existingContact.email !== contactPayload.email ||
                    existingContact.phoneNumber !== contactPayload.phoneNumber
                ) {
                    contactToSave = this.createSecondaryContact(contactPayload, existingContact.id);
                } else {
                    // No new contact to save, return existing
                    return existingContact;
                }
            }

            // Save only if a new/updated contact is needed
            if (contactToSave) {
                return await contactRepo.save(contactToSave);
            } else {
                return matchingContacts[0]; // Return the first matching contact as a fallback ( oldest matching contact )
            }
        } catch (error) {
            console.error("Error creating contact:", error);
            throw new Error("Failed to create contact");
        }
    }

    private async findAllMatchingContacts(contactRepo: any, contactPayload: ContactPayload): Promise<Contact[]> {
        return contactRepo.find({
            where: [
                { email: contactPayload.email },
                { phoneNumber: contactPayload.phoneNumber }
            ],
            order: { createdAt: "ASC" }
        });
    }

    private shouldMergeContacts(matchingContacts: Contact[], contactPayload: ContactPayload): boolean {
        const emailContact = matchingContacts.find(c => c.email === contactPayload.email);
        const phoneContact = matchingContacts.find(c => c.phoneNumber === contactPayload.phoneNumber);
        return (
            emailContact &&
            phoneContact &&
            emailContact.id !== phoneContact.id
        );
    }

    private async handleMergeContacts(matchingContacts: Contact[], contactPayload: ContactPayload): Promise<Contact | null> {
        const emailContact = matchingContacts.find(c => c.email === contactPayload.email)!;
        const phoneContact = matchingContacts.find(c => c.phoneNumber === contactPayload.phoneNumber)!;

        // Oldest becomes primary
        const [primary, secondary] = emailContact.createdAt < phoneContact.createdAt
            ? [emailContact, phoneContact]
            : [phoneContact, emailContact];

        // Update secondary to be linked to primary if needed
        if (secondary.linkPrecedence !== LinkPrecedence.SECONDARY || secondary.linkedId !== primary.id) {
            secondary.linkPrecedence = LinkPrecedence.SECONDARY;
            secondary.linkedId = primary.id;
            return secondary;
        }

        // If the incoming payload matches the secondary, return it, else create a new secondary
        if (
            contactPayload.email === secondary.email &&
            contactPayload.phoneNumber === secondary.phoneNumber
        ) {
            return null; // No save needed, will return secondary from createContact
        } else if (
            contactPayload.email === primary.email &&
            contactPayload.phoneNumber === primary.phoneNumber
        ) {
            return null; // No save needed, will return primary from createContact
        } else {
            // Create a new secondary linked to primary
            return this.createSecondaryContact(contactPayload, primary.id);
        }
    }

    private createPrimaryContact(contactPayload: ContactPayload): Contact {
        return Object.assign(new Contact(), {
            email: contactPayload.email,
            phoneNumber: contactPayload.phoneNumber,
            linkPrecedence: LinkPrecedence.PRIMARY,
            linkedId: null
        });
    }

    private createSecondaryContact(contactPayload: ContactPayload, linkedId: number): Contact {
        return Object.assign(new Contact(), {
            email: contactPayload.email,
            phoneNumber: contactPayload.phoneNumber,
            linkPrecedence: LinkPrecedence.SECONDARY,
            linkedId
        });
    }
}