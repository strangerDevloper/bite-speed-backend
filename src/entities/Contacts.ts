import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert } from "typeorm";
import { LinkPrecedence } from "./types";

@Entity("contacts")
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", nullable: true, name: "phone_number" })
    phoneNumber: string | null;

    @Column({ type: "varchar", nullable: true })
    email: string | null;

    @Column({ type: "int", nullable: true, name: "linked_id" })
    linkedId: number | null;

    @Column({
        type: "enum",
        enum: LinkPrecedence,
        default: LinkPrecedence.SECONDARY,
        name: "link_precedence"
    })
    linkPrecedence: LinkPrecedence;

    @CreateDateColumn({ 
        type: "timestamp", 
        name: "created_at",
        default: () => "CURRENT_TIMESTAMP"
    })
    createdAt: Date;

    @UpdateDateColumn({ 
        type: "timestamp", 
        name: "updated_at",
        default: () => "CURRENT_TIMESTAMP",
    })
    updatedAt: Date;

    @DeleteDateColumn({ type: "timestamp", nullable: true, name: "deleted_at" })
    deletedAt: Date | null;

}
