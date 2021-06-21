import { BaseEntity } from ".."

export function Relation(local: string, ctr: new () => any, foreign = '_id', isObjectId = true) {
  return function <T extends BaseEntity>(target: T, propertyKey: string): void {
    const type = Reflect.getMetadata('design:type', target, propertyKey)

    target.constructor.relations.push(
      {
        localKey: local,
        foreignKey: foreign,
        relation: type === Array ? 'many' : 'one',
        type: ctr,
        property: propertyKey,
        fieldName: target.constructor.getDatabaseName(ctr.name),
        isObjectId
      }
    )
  }
}