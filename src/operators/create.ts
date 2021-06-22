import { ObjectID } from "bson";
import { classToPlain, plainToClass } from "class-transformer";
import { BaseEntity } from "../entity";
import { ModifierBuilder } from "../query";
import { Properties } from "../types";

export abstract class CreateOperator extends ModifierBuilder {
  /**
   * Save object and return object with generated ID
   *
   * @param { boolean } relation Enable creating relation
   * @return { this }
   */
  public async create(relation = true): Promise<this> {
    let data = classToPlain(this, { ignoreDecorators: true });

    if (relation) {
      data = await this.handleRelation(data, async (entity) => await entity.create())
    } else {
      data = this.disableRelation(data)
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

  /**
   * Handle relation transforming with a callback to execute nested entity action
   *
   * @param { Record<string, any> } data
   * @param { (entity: BaseEntity) => Promise<BaseEntity> } callback Callback to create or update model
   * @returns { Promise<Record<string, any>> }
   */
  protected async handleRelation(data: Record<string, any>, callback: (entity: BaseEntity) => Promise<BaseEntity>): Promise<Record<string, any>> {
    for (const relation of this.constructor.relations) {
      if (relation.property in this && this[relation.property] instanceof BaseEntity) {
        const entity = await callback(<BaseEntity>this[relation.property])

        // Set relation ID on MongoDB payload
        data[relation.localKey] = entity._id

        // Set entity on instance
        this[relation.property] = entity

        // Prevent saving sub-document
        delete data[relation.property]
      }
    }

    return data
  }

  /**
   * Disable relation and delete nested attributes
   *
   * @param { Record<string, any> } data JSON Data
   * @returns { Record<string, any> }
   */
  protected disableRelation(data: Record<string, any>): Record<string, any> {
    for (const relation of this.constructor.relations) {
      delete data[relation.property]
    }

    return data
  }
}