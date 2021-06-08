import { classToPlain } from "class-transformer";
import { ObjectID } from "mongodb";
import { BaseEntity } from "../entity";
import { Properties } from "../types";
import { ReadOperator } from "./read";

export abstract class UpdateOperator extends ReadOperator {
  /**
   * Update an object statically by its ID
   *
   * @param { string | ObjectID } id ID of the object
   * @param { Properties<T> } data Data
   */
  public static async update<T extends typeof BaseEntity>(this: T, id: string | ObjectID, data: Properties<T>): Promise<T['prototype'] | undefined> {
    // Get object
    const instance = await this.findOne(id)

    // Assign data
    Object.assign(instance, data)

    // Update
    return await instance?.update()
  }

  /**
   * Update the object
   */
  public async update(): Promise<this> {
    const data = classToPlain(this, { ignoreDecorators: true });
    delete data._id;

    await this.repository.updateOne({
      _id: new ObjectID(this._id)
    }, {
      $set: data
    });

    return this;
  }
}