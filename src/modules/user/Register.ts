import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { hash } from "bcryptjs";
import { User } from "../../entity/User";
import { RegisterInput } from "./register/RegisterInput";

@Resolver()
export class RegisterResolver {
  @Query(() => String)
  async helloWorld() {
    return "Hello Christos";
  }

  @Mutation(() => User)
  async register(@Arg("data")
  {
    email,
    firstName,
    lastName,
    password
  }: RegisterInput): Promise<User> {
    const hashedPassword = await hash(password, 12);

    return User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    }).save();
  }
}
