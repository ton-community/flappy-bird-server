import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Purchase } from "./Purchase"

@Entity()
export class Item {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
    })
    cost: number

    @Column({
        nullable: false,
    })
    name: string

    @Column({
        nullable: false,
    })
    systemName: string

    @Column({
        nullable: false,
    })
    type: string

    @OneToMany(() => Purchase, purchase => purchase.item)
    purchases: Purchase[]

}
