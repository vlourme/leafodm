import { BaseEntity } from "../src"

export class User extends BaseEntity {
  name: string
  email: string
  password: string
}
