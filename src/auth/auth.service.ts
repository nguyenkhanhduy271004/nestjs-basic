import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private rolesService: RolesService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(username);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password);
            if (isValid) {
                const userRole = user.role as unknown as { _id: string, name: string };
                const temp = await this.rolesService.findOne(userRole._id);


                const objUser = {
                    ...user.toObject(),
                    permissions: temp?.permissions ?? []
                }

                return objUser;
            }
        }
        return null;
    }

    async login(user: IUser, response: Response) {
        const { _id, name, email, role, company, permissions } = user;
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role,
            companyId: company._id
        };
        const refresh_token = await this.createRefreshToken(payload);
        await this.usersService.updateUserToken(refresh_token, _id);
        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE"))
        })
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                name,
                email,
                role,
                permissions,
            }
        };
    }

    async createRefreshToken(payload: any) {
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            expiresIn: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")) / 1000
        });
        return refresh_token;
    }

    async handleRefreshToken(refreshToken: string, response: Response) {
        try {
            const decoded = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            });

            const user = await this.usersService.findUserByToken(refreshToken);

            if (!user) {
                throw new BadRequestException('User không tồn tại');
            }

            const { _id, name, email, company, role } = user;

            const payload = {
                sub: "token refresh",
                iss: "from server",
                _id,
                name,
                email,
                role,
                companyId: company._id
            };

            const refresh_token = await this.createRefreshToken(payload);

            await this.usersService.updateUserToken(refresh_token, decoded._id);

            const userRole = user.role as unknown as { _id: string, name: string };
            const temp = await this.rolesService.findOne(userRole._id);

            response.clearCookie('refresh_token');
            response.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE"))
            })

            return {
                access_token: this.jwtService.sign(payload),
                users: {
                    _id,
                    name,
                    email,
                    role,
                    permissions: temp?.permissions ?? []
                }

            };
        } catch (error) {
            throw new BadRequestException('Refresh token không hợp lệ vui lòng login');
        }
    }



    async handleLogout(res: Response, user: IUser) {
        try {
            await this.usersService.updateUserToken("", user._id);
            res.clearCookie('refresh_token')
            return 'ok';
        } catch (error) {
            console.log(error);
        }
    }


    // async handleGetProfile(user: any) {
    //     return {
    //         data: user
    //     }
    // }
}
