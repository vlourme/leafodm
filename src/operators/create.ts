import { classToPlain } from "class-transformer";
import { ModifierBuilder } from "../query";

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
}