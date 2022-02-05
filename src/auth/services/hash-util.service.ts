import {Injectable} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

@Injectable()
export class HashUtilService {
    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async doesPasswordMatch(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }

    createToken(): Promise<string> {
        const resetToken = crypto.randomBytes(20).toString('hex');

        return bcrypt.hash(resetToken, 10);
    }

    compareTokens(token, storedToken): Promise<boolean> {
        return bcrypt.compare(token, storedToken);
    }
}
