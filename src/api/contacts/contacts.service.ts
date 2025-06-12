import { getRepository } from "typeorm";
import { Contact } from "../../entities/Contacts";
import { ContactPayload, IdentifyContactRequest, IdentifyContactResponse } from "./contacts.interface";
import { LinkPrecedence } from "../../entities/types";

export class ContactsService {
    public async getAllContacts(): Promise<Contact[]> {
        try {
            const contactRepo = getRepository(Contact);
            // Fetch all contacts ordered by creation date
            return await contactRepo.find({
                order: { createdAt: "ASC" }
            });
        } catch (error) {
            console.error("Error fetching contacts:", error);
            throw new Error("Failed to fetch contacts");
        }
    }

    public async identifyContact(contactPayload: IdentifyContactRequest): Promise<IdentifyContactResponse | null> {
        try {
            const contactRepo = getRepository(Contact);

            // 1. Find all contacts matching the provided email or phone number
            const matchingContacts = await this.findMatchingContacts(contactRepo, contactPayload);

            if (matchingContacts.length === 0) {
                return null;
            }

            // 2. Find the primary contact (root)
            const primaryContact = await this.findPrimaryContact(contactRepo, matchingContacts);

            console.log("Primary contact identified:", primaryContact);
            // 3. Find all contacts linked to this primary (including itself)
            const allRelatedContacts = await this.findAllRelatedContacts(contactRepo, primaryContact);

            // 4. Build the response
            return this.buildIdentifyContactResponse(primaryContact, allRelatedContacts);
        } catch (error) {
            console.error("Error identifying contact:", error);
            throw new Error("Failed to identify contact");
        }
    }

    private async findMatchingContacts(contactRepo: any, contactPayload: IdentifyContactRequest): Promise<Contact[]> {
        const whereClause = [];
        if (contactPayload.email) whereClause.push({ email: contactPayload.email });
        if (contactPayload.phoneNumber) whereClause.push({ phoneNumber: contactPayload.phoneNumber });
        if (whereClause.length === 0) return [];
        return contactRepo.find({
            where: whereClause,
            order: { createdAt: "ASC" }
        });
    }

    private async findPrimaryContact(contactRepo: any, contacts: Contact[]): Promise<Contact> {
        // Find the oldest primary, or fallback to the first contact
        let primary = contacts.find(c => c.linkPrecedence === LinkPrecedence.PRIMARY) || contacts[0];
        // If this contact is secondary, fetch its primary
        if (primary.linkedId) {
            const root = await contactRepo.findOne({ where: { id: primary.linkedId } });
            if (root) primary = root;
        }
        return primary;
    }

    private async findAllRelatedContacts(contactRepo: any, primaryContact: Contact): Promise<Contact[]> {
        return contactRepo.find({
            where: [
                { id: primaryContact.id },
                { linkedId: primaryContact.id }
            ],
            order: { createdAt: "ASC" }
        });
    }

    private buildIdentifyContactResponse(primaryContact: Contact, allRelatedContacts: Contact[]): IdentifyContactResponse {
        const emails: string[] = [];
        const phoneNumbers: string[] = [];
        const secondaryContactIds: number[] = [];

        // Always put primary's email/phone first
        if (primaryContact.email) emails.push(primaryContact.email);
        if (primaryContact.phoneNumber) phoneNumbers.push(primaryContact.phoneNumber);

        for (const contact of allRelatedContacts) {
            if (contact.id === primaryContact.id) continue;
            if (contact.email && !emails.includes(contact.email)) emails.push(contact.email);
            if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) phoneNumbers.push(contact.phoneNumber);
            if (contact.linkPrecedence === LinkPrecedence.SECONDARY) {
                secondaryContactIds.push(contact.id);
            }
        }

        return {
            contact: {
                primaryContactId: primaryContact.id,
                emails,
                phoneNumbers,
                secondaryContactIds
            }
        };
    }

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