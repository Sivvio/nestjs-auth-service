import {BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Exclude} from "class-transformer";
import {UserStatus} from "../models/user-status.enum";
import {PasswordReset} from "./password-reset.entity";
import {IsEmail, IsNotEmpty, IsUUID} from "class-validator";


@Entity({name: 'users'})
export class User extends BaseEntity {

    @IsUUID()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @IsEmail()
    @Column()
    email: string;

    @IsNotEmpty()
    @Exclude()
    @Column()
    password: string;

    @Exclude()
    @Column({default: UserStatus.INACTIVE})
    status: UserStatus;

    @OneToOne(() => PasswordReset, {onDelete: 'CASCADE'})
    @JoinColumn()
    passwordReset?: PasswordReset;

}
