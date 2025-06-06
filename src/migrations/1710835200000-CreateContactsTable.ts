import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateContactsTable1710835200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First create the enum type
        await queryRunner.query(
            `CREATE TYPE link_precedence_enum AS ENUM ('primary', 'secondary')`
        );

        await queryRunner.createTable(
            new Table({
                name: "contacts",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "phone_number",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "linked_id",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "link_precedence",
                        type: "link_precedence_enum",
                        default: "'secondary'",
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "deleted_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["linked_id"],
                        referencedTableName: "contacts",
                        referencedColumnNames: ["id"],
                        onDelete: "SET NULL",
                    },
                ],
                indices: [
                    {
                        name: "idx_contacts_email",
                        columnNames: ["email"],
                    },
                    {
                        name: "idx_contacts_phone",
                        columnNames: ["phone_number"],
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("contacts");
        await queryRunner.query(`DROP TYPE link_precedence_enum`);
    }
} 