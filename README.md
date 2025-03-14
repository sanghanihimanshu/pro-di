# pro-di

A lightweight yet powerful dependency injection container for Node.js and TypeScript applications.

## What is pro-di?

pro-di makes it easy to:

- Manage dependencies in your application
- Write cleaner, more maintainable code
- Test components in isolation

## Key Features

✨ **Simple Global Container**
One container to rule them all - easy setup with zero configuration

🎯 **Smart Module System**
Group related dependencies using `defineModule`

🔧 **Decorator Support**
Register dependencies effortlessly:

## Getting Started

```bash
npm install pro-di
# or
pnpm add pro-di
```

## Complete Example

Here's a comprehensive example showing how to use pro-di:

```javascript
// Define interfaces
const IUserRepository = Symbol("IUserRepository");
const IAuthService = Symbol("IAuthService");

// implementations.js
class UserRepository {
  async findById(id) {
    return await db.users.findOne(id);
  }
}

class AuthService {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  validateUser(user) {
    // Validation logic
    return true;
  }
}

// usage.js
const container = new Container();

// Register services
container.register(IUserRepository, UserRepository);
container.register(IAuthService, {
  useClass: AuthService,
  inject: [IUserRepository]
});

// Register module
container.registerModule({
  services: [
    { token: IUserRepository, useClass: UserRepository },
    { token: IAuthService, useClass: AuthService }
  ]
});

// Use services
const authService = container.resolve(IAuthService);
const isValid = authService.validateUser(someUser);
```

This example demonstrates:

- Interface definitions
- Service decorators
- Dependency injection
- Container setup
- Module registration
- Service resolution

<!--
Check out our [documentation](link) to learn more! -->
