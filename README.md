# @shadow-library/mongoose

`@shadow-library/mongoose` is a MongoDB integration module for the Shadow application framework. Inspired by `@nestjs/mongoose`, it provides a seamless and structured way to define schemas, connect to databases, and inject Mongoose models into your application using decorators and a module-based architecture.

## ✨ Features

- Connect to MongoDB using a declarative, modular API
- Define Mongoose schemas using class decorators
- Inject models via dependency injection
- Supports multiple connections and async configuration
- Follows the architectural conventions of the Shadow framework

## 📦 Installation

```bash
# npm
npm install @shadow-library/mongoose mongoose

# Yarn
yarn add @shadow-library/mongoose mongoose

# pnpm
pnpm add @shadow-library/mongoose mongoose

# bun
bun add @shadow-library/mongoose mongoose
```

## 🚀 Getting Started

### 1. Register the Mongoose Module

```ts
import { Module } from '@shadow-library/app';
import { MongooseModule } from '@shadow-library/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/shadow-db')],
})
export class AppModule {}
```

### 2. Define a Schema with Decorators

```ts
import { Schema, Prop, SchemaFactory } from '@shadow-library/mongoose';

@Schema()
export class User {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    unique: true,
  })
  email: string;

  @Prop({
    type: Number,
  })
  age: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### 3. Register the Feature Model

```ts
import { Module } from '@shadow-library/app';
import { MongooseModule } from '@shadow-library/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UserService],
})
export class UserModule {}
```

### 4. Inject and Use the Model

```ts
import { Injectable } from '@shadow-library/app';
import { InjectModel } from '@shadow-library/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  async findAll() {
    return this.userModel.find().exec();
  }
}
```

## 🧩 Advanced Configuration

### Async Initialization

```ts
MongooseModule.forRootAsync({
  useFactory: async () => ({
    uri: process.env.MONGO_URI,
    dbName: 'custom-db',
  }),
});
```

### Multiple Connections

```ts
MongooseModule.forRoot('mongodb://localhost/db1', { connectionName: 'db1' }),
MongooseModule.forRoot('mongodb://localhost/db2', { connectionName: 'db2' }),
```

And register models per connection:

```ts
MongooseModule.forFeature(
  [{ name: User.name, schema: UserSchema }],
  'db1',
),
```

## 📖 API Reference

- `MongooseModule.forRoot(uri, options?)` – Register a global connection
- `MongooseModule.forRootAsync(options)` – Register connection asynchronously
- `MongooseModule.forFeature(models, connectionName?)` – Register feature models
- `@Schema()` – Decorate a class as a Mongoose schema
- `@Prop(options)` – Decorate properties as schema fields
- `SchemaFactory.createForClass(Class)` – Create schema from class
- `@InjectModel(name, connectionName?)` – Inject a Mongoose model

## 🛠 Requirements

- Node.js v22+
- Mongoose v8+
- Shadow application framework (based on `@shadow-library/app`)

## 📝 License

MIT

---

Built with ❤️ for the [Shadow](https://www.npmjs.com/org/shadow-library) application ecosystem.
