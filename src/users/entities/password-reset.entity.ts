import {BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";

@Entity({name: 'password_resets'})
export class PasswordReset extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'date', default: new Date(new Date().setDate(new Date().getDate() + 1))})
    expirationDate: Date;

    @Column()
    token: string;

    @OneToOne(() => User, user => user.passwordReset)
    user: User;
}
