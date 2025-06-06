import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private rolesService: RolesService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        });
    }

    async validate(payload: any) {
        const { _id, name, email, companyId, role } = payload;

        const userRole = role as unknown as { _id: string, name: string };
        const temp = (await this.rolesService.findOne(userRole._id)).toObject();

        return {
            _id,
            name,
            email,
            companyId,
            role,
            permissions: temp?.permissions ?? []
        };
    }
}
