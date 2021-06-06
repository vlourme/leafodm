# Leaf ODM
Leaf ODM is an abstraction layer for MongoDB on NodeJS. It aims to provide a better class support for MongoDB while keeping it's schema-less feature.

## Philosophy
Nowadays the official MongoDB provides really good support and I think we don't really need any ODM/ORM for MongoDB on NodeJS, at least when using JavaScript.
When using TypeScript, it's a bit different, most TS users want to use classes to have strong typing and prevent errors, but you can't pass a class instance to MongoDB.

Actual libraries such as TypeORM and Mongoose still have some issues:
- TypeORM is the best for TypeScript users, but it seems to lose the schema-less feature (if you have a key that is not defined in your class).
- Mongoose does not support classes and uses a JS object as schema (which does not allow optional and union types).

I was at this time trying to develop an API and I knew that some fields are dynamic and cannot be defined in a schema.
As a TypeScript user, I tried TypeORM but lost the schema-less feature, and Mongoose was not adapted for the project.

So, I just decided to create my own abstraction layer on top of MongoDB's official driver.

## Quick start
Start by installing the dependency:
```sh
# Using NPM:
npm install leafodm

# Using Yarn:
yarn add leafodm
```

Then, connect your database in your app entry-point:
```ts
import { DatabaseManager } from 'leafodm'

await DatabaseManager.init('mongodb://localhost:27017/database')

// With dotenv:
await DatabaseManager.init(process.env.DATABASE_URL)
```
**Note: I highly recommend you to use `dotenv` here, never let your credentials hardcoded.**

Now, you can define a model such as:
```ts
import { BaseEntity } from 'leafodm'

class User extends BaseEntity {
  name: string
  email: string
  password: string
}
```

That's done! You are now able run queries on your model, here are some examples:

### Create an object
```ts
const user = new User()
user.name = 'John Doe'
user.email = 'jdoe@example.org'
user.password = 'abcd1234'

await user.create()
```

### Find an object
```ts
await User.findOne({ email: 'jdoe@example.org' }) // -> Return first document that contains 'jdoe@example.org' as email
await User.findOne('60bbedee3310443e74b495da') // -> Return document by its ID
```

### Find multiple objects
```ts
await User.find({ name: 'John Doe' }) // -> Every users with 'John Doe' as name
await User.find() // -> Return the whole collection

// It's also possible to set multiple conditions
await User.find({
  _id: '60bbedee3310443e74b495da',
  admin: true
}) // -> Return a user that correspond to this ID and that is an admin
```
*Note: _id are automatically converted to ObjectId, even nested*

### Update an object
```ts
const user = await User.findOne('60bbedee3310443e74b495da')

user.name = 'John Doe Jr'

await user.update()
```

### Delete an object
```ts
const user = await User.findOne('60bbedee3310443e74b495da')

user.name = 'John Doe Jr'

await user.delete()
```

### Sort by
```ts
const users = await User.sortBy({
  name: 'DESC'
}).find()
```

### Take/Limit
```ts
const users = await User.take(5).find() // Will only return 5 documents
```

### Skip
```ts
const users = await User.skip(5).find() // Will skip 5 first documents
```

## Usage tips
This library is very useful when combined with [`class-transformer`](https://github.com/typestack/class-transformer/) and [`class-validator`](https://github.com/typestack/class-validator),
no need to instance your model and write date to every fields.
Here is an example with the web framework [FoalTS](http://foalts.org/):
```ts
@Post('/register')
@ValidateBody(User)
async createUser(ctx: Context) {
  const user: User = ctx.request.body

  const exists = User.findOne({
    email: user.email
  })

  if (exists) {
    throw new HttpResponseBadRequest('this email is already taken')
  }

  return new HttpResponseOK({
    status: true,
    message: 'account created',
    data: await user.create(),
  });
}
```

## Roadmap
You can follow and track the work on [project](https://github.com/vlourme/leafodm/projects/1).

My goals for future releases are:
- Improve type support (e.g.: `sortBy` should suggest only properties)
- Support more MongoDB methods (mass-insertion, mass-delete, etc.)
- Add new static implementations such as `User.delete(id)` to prevent creating an instance before.
- Add a constructor that takes JSON arguments (directly from requests) like: `new User({ name: 'John Doe' })` (inspired from Laravel Eloquent)
- Improve method chaining (`sortBy`, `take` and `skip`, this works but the code behind is not well maintainable)
- Improve global structure and code coherence.
- Provide a documentation

## Contribution
Contributing is welcome, you can clone this project and make PR if you want!
Just make sure you use same code style and follow ESLint.

If you find any bugs or suggestion, feel free to open an issue.
For questions, please uses discussions.