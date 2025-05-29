export interface IUser {
    _id: string;
    name: string;
    email: string;
    company: {
        _id: string;
        name: string;
    }
    role: {
        _id: string;
        name: string;
    };

    permissions?: {
        _id: string;
        name: string;
        apiPath: string;
        module: string;
    }[]
}