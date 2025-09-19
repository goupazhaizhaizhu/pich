import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService { 

    constructor(@InjectRepository(User)
        private readonly userRepository: Repository<User>) { }

    async getUserInfo(params: { openId: string }) { 
        const { openId } = params;
        return await this.userRepository.findOne({ openId });
    }
}