import { UserRoles } from 'api_client';

export class User {
  Username: string;
  Email: string;
  Token: string;
  CustomerName: string;
  CustomerIdentifier: string;
  Roles: UserRoles[];
}
