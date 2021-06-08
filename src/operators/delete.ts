import { ObjectID } from "mongodb";
import { UpdateOperator } from "./update";

export abstract class DeleteOperator extends UpdateOperator {
  /**
   * Delete an object
   *
   * @return { boolean }
   */
  public async delete(): Promise<boolean> {
    const res = await this.repository.deleteOne({
      _id: new ObjectID(this._id)
    });

    return res.deletedCount === 1;
  }

  /**
   * Delete an object by its ID
   *
   * @param { string | ObjectID } id
   * @returns { Promise<boolean> }
   */
  public static async delete<T extends typeof DeleteOperator>(this: T, id: string | ObjectID): Promise<boolean> {
    if (typeof id === 'string') {
      id = new ObjectID(id)
    }

    const res = await this.repository.deleteOne({
      _id: id
    })

    return res.deletedCount === 1
  }
}