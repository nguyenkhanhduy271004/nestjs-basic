import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { RegisterUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UsersService,
        private rolesService: RolesService
    ) { }

    @Public()
    @Post('login')
    @ApiBody({ type: UserLoginDto })
    @UseGuards(LocalAuthGuard)
    @UseGuards(ThrottlerGuard)
    @ResponseMessage('User login')
    handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
    }

    @Get('account')
    @ResponseMessage('Get user information')
    async handleGetAccount(@User() user: IUser) {
        const temp = await this.rolesService.findOne(user.role._id) as any;
        user.permissions = temp.permissions;
        return { user };
    }

    @Public()
    @Get('refresh')
    @ResponseMessage('Get user by refresh token')
    handleRefreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refresh_token = request.cookies['refresh_token'];
        return this.authService.handleRefreshToken(refresh_token, response);
    }

    @Public()
    @Get('register')
    @ResponseMessage('Register a new user')
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.userService.handleRegister(registerUserDto);
    }

    @Post('logout')
    @ResponseMessage('Logout User')
    handleLogout(@Res({ passthrough: true }) res: Response, @User() user: IUser) {
        return this.authService.handleLogout(res, user);
    }

    // @UseGuards(JwtAuthGuard)
    @Get('/profile')
    handleGetProfile(@Req() req) {
        return req.user;
    }



}
