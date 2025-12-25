import { UserService } from './user.service';
import { User } from '../entities/user.entity';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(userData: Partial<User>): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    update(id: string, userData: Partial<User>): Promise<User>;
    remove(id: string): Promise<void>;
}
