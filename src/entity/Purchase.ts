import { Entity, Column, PrimaryGeneratedColumn, Unique, ManyToOne } from "typeorm"
import { Item } from "./Item"
import { User } from "./User"

@Entity()
@Unique('user_item', ['user', 'item'])
export class Purchase {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, user => user.purchases)
    user: User

    @ManyToOne(() => Item, item => item.purchases)
    item: Item

    @Column({
        nullable: false,
        length: 44,
    })
    txHash: string

    @Column({
        type: 'bigint',
        nullable: false,
    })
    txLt: string

}
