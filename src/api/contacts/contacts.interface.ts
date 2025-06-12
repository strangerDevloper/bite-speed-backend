
export interface ContactPayload {
    email: string;
    phoneNumber: string;
}


export interface ContactResponse {
    id: number;
    phoneNumber: string;
    email: string;
    linkedId: number | null;
    linkPrecedence: 'primary' | 'secondary';
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}


export interface getAllContactsResponse {
    contacts: ContactResponse[];
}


export interface IdentifyContactRequest {
    email?: string;
    phoneNumber?: string;
}


export interface IdentifyContactResponse {
    contact: {
        primaryContactId: number;
        emails: string[];
        phoneNumbers: string[];
        secondaryContactIds: number[];
    };
}

