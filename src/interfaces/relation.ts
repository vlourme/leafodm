import { BaseEntity } from "../entity";

export interface IRelation {
  localKey: string,
  foreignKey: string,
  relation: 'one' | 'many',
  type: { new(): typeof BaseEntity },
  property: string,
  isObjectId: boolean
  fieldName: string
}