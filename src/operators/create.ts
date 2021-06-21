import { ObjectID } from "bson";
import { classToPlain, plainToClass } from "class-transformer";
import { BaseEntity } from "../entity";
import { ModifierBuilder } from "../query";
import { Properties } from "../types";

export abstract class CreateOperator extends ModifierBuilder {
  /**
   * Save object and return object with generated ID
   *
   * @param { boolean } nested When true, relation will be nested in main entity
   * @return { this }
   */
  public async create(nested = false): Promise<this> {
    const data = classToPlain(this, { ignoreDecorators: true });

    for (const relation of this.constructor.relations) {
      if (!nested && relation.property in this && this[relation.property] instanceof BaseEntity) {
        const entity = await (<BaseEntity>this[relation.property]).create()

        // Set relation ID on MongoDB payload
        data[relation.localKey] = entity._id

        // Set entity on instance
        this[relation.property] = entity

        // Prevent saving sub-document
        delete data[relation.property]
      }
    }

    const { insertedId } = await this.constructor.repository.insertOne(data);
    this._id = (insertedId as ObjectID).toHexString();

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