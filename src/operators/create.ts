import { classToPlain, plainToClass, plainToClassFromExist } from "class-transformer";
import { BaseEntity } from "../entity";
import { ModifierBuilder } from "../query";
import { Properties } from "../types";

export abstract class CreateOperator extends ModifierBuilder {
  /**
   * Save object and return object with generated ID
   */
  public async create(): Promise<this> {
    const data = classToPlain(this, { ignoreDecorators: true });

    const { insertedId } = await this.repository.insertOne(data);
    this._id = insertedId;

    return this;
  }

  /**
   * Insert many object in one method
   *
   * @param { Properties<T>[] } data Properties
   * @returns { Promise<T['prototype'][]> } Converted data array to models
   */
  public static async createMany<T extends typeof BaseEntity>(this: T, data: Properties<T>[]): Promise<T['prototype'][]> {
    await this.repository.insertMany(data)

    return data.map(v => plainToClass(this, v))
  }
}