import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity()
export class User {

    @PrimaryColumn({
        nullable: false,
    })
    id: number

    @Column({
        length: 48,
        nullable: false,
    })
    wallet: string

    @Column({
        default: 0,
        nullable: false,
    })
    highScore: number

    @Column({
        default: 0,
        nullable: false,
    })
    plays: number

}
