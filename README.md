# @shadow-library/mongoose

`@shadow-library/mongoose` is a powerful integration package for connecting and managing MongoDB within Node.js applications.
This package provides an easy-to-use module system, efficient connection management, and feature-rich utilities for building scalable and maintainable server-side applications.

## Features

- **Seamless MongoDB Integration**: Simplifies MongoDB connection and configuration in your application.
- **Modular Architecture**: Follows a module-based structure to promote organized and maintainable code.
- **Schema and Model Generation**: Automatically generate and use Mongoose schemas and models using decorators.
- **Advanced Query and CRUD Operations**: Provides an intuitive API for querying and managing data.
- **Dependency Injection**: Integrates with DI systems for easy injection of services and repositories.
- **Customizable Configuration**: Allows flexibility in managing multiple database connections and custom configurations.

## Installation

Install the package using npm or yarn:

```bash
npm install @shadow-library/mongoose mongoose
# or
yarn add @shadow-library/mongoose mongoose
```

## Usage

### 1. Setting Up the Mongoose Module

Import and configure the `MongooseModule` in your main application module to establish a connection.

```typescript
import { Module } from '@shadow-library/app';
import { MongooseModule } from '@shadow-library/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
  ],
})
export class AppModule {}
```

### 2. Creating Mongoose Schemas

Define Mongoose schemas using decorators to streamline model creation.

```typescript
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
    min: 18,
  })
  age: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### 3. Using Models in Services

Inject the model into your services for CRUD operations.

```typescript
import { Injectable } from '@shadow-library/app';
import { InjectModel } from '@shadow-library/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(name: string, email: string, age: number): Promise<User> {
    const newUser = new this.userModel({ name, email, age });
    return newUser.save();
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
```

## Advanced Features

### Multiple Database Connections

`@shadow-library/mongoose` supports multiple database connections for complex applications.

```typescript
@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/database1', { connectionName: 'db1' }), MongooseModule.forRoot('mongodb://localhost/database2', { connectionName: 'db2' })],
})
export class AppModule {}
```

### Custom Connection Options

Pass custom configuration options to suit your requirements.

```typescript
MongooseModule.forRoot('mongodb://localhost/custom-db', {
  connectionFactory: connection => {
    console.log('Custom Connection Initialized');
    return connection;
  },
});
```

## API

### `MongooseModule.forRoot(uri: string, options?: MongooseModuleOptions)`

Connects to a MongoDB instance with the specified URI and options.

### `Schema()`

Decorator to define a schema class for Mongoose.

### `Prop(options: PropertyOptions)`

Decorator to declare properties with specific schema options.

### `SchemaFactory.createForClass(Class)`

Generates a Mongoose schema based on the decorated class.

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests for new features or improvements.

## License

This project is licensed under the MIT License.
