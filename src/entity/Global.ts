import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity()
export class Global {

    @PrimaryColumn({
        nullable: false,
    })
    key: string

    @Column({
        nullable: false,
    })
    value: string

}
