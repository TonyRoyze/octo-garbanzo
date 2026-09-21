# Reciptile Spring Boot beginner guide

This guide explains how the Reciptile backend works. It is written for someone who is
still learning Spring Boot. Keep it open while reading the Java files.

## 1. The main idea

The backend uses a simple three-layer structure:

```text
HTTP request
    ↓
Controller — receives the request and returns the response
    ↓
Service — contains the application rules
    ↓
Repository — reads and writes MongoDB data
```

For example, when an admin creates a product:

1. `ProductController.create()` receives `POST /api/products`.
2. Spring converts the JSON body into a `ProductRequest`.
3. `@Valid` checks the rules written on `ProductRequest`.
4. `ProductService.create()` trims the text and creates a `Product`.
5. `ProductRepository.save()` stores the product in MongoDB.
6. The controller returns the saved product with HTTP status `201 Created`.

This separation gives each class one main job. Controllers handle HTTP, services handle
rules, repositories handle data, and model classes describe the data.

## 2. Where to start reading

Read the backend in this order:

1. `ReciptileApiApplication.java` — starts Spring Boot.
2. `controller/ProductController.java` — defines the product URLs.
3. `service/ProductService.java` — contains the product rules.
4. `repository/ProductRepository.java` — connects products to MongoDB.
5. `product/Product.java` and `ProductRequest.java` — describe product data.
6. Repeat the same controller → service → repository path for authentication and invoices.
7. Read the files in `config` last. They configure security, MongoDB, and browser access.

The main source folders now have clear responsibilities:

```text
com/reciptile/api/
├── controller/   HTTP endpoints
├── service/      application rules
├── repository/   MongoDB access
├── auth/         authentication data types and errors
├── product/      product data types and errors
├── invoice/      invoice data types and errors
├── config/       Spring configuration
├── common/       shared exception handling
└── seed/         optional demo data
```

The three layer folders answer **where the work happens**. The `auth`, `product`, and
`invoice` folders hold the data objects used by those layers.

## 3. Java and Spring definitions

### Common Java words

| Word | Meaning in this project |
| --- | --- |
| `class` | A definition that groups data and functions. `ProductService` is a class. |
| `interface` | A contract. Spring creates the real repository implementation from each repository interface. |
| `record` | A short way to create an immutable data carrier. Request and response objects use records. |
| `enum` | A fixed list of allowed values, such as `ACTIVE` and `DRAFT`. |
| constructor | A function with the same name as its class. It creates an object or supplies its dependencies. |
| method | A function inside a class, such as `ProductService.create()`. |
| `public` | Other classes can call it. |
| `private` | Only the class that owns it can call it. |
| `final` | The field is assigned once and cannot point to a different object later. |
| exception | An object used to stop normal execution and report an error. |
| `Optional<T>` | A value that may be present or absent. It helps avoid returning `null`. |

### Important Spring annotations

Annotations begin with `@` and give instructions to Spring.

| Annotation | What it does |
| --- | --- |
| `@SpringBootApplication` | Marks the main application class and enables Spring Boot setup. |
| `@RestController` | Marks a class that receives HTTP requests and returns JSON. |
| `@RequestMapping` | Sets the common URL at the top of a controller. |
| `@GetMapping` | Runs a method for an HTTP GET request. |
| `@PostMapping` | Runs a method for an HTTP POST request. |
| `@PutMapping` | Runs a method for an HTTP PUT request. |
| `@DeleteMapping` | Runs a method for an HTTP DELETE request. |
| `@RequestBody` | Converts a JSON request body into a Java object. |
| `@PathVariable` | Reads a value from the URL, such as the `id` in `/products/{id}`. |
| `@RequestParam` | Reads a query parameter, such as `q` in `/products?q=note`. |
| `@Valid` | Runs validation annotations before the controller method continues. |
| `@Service` | Marks a class that contains application rules. |
| `@Document` | Maps a class to a MongoDB collection. |
| `@Id` | Marks the MongoDB document ID. |
| `@CreatedDate` | Lets Spring set the creation time automatically. |
| `@LastModifiedDate` | Lets Spring update the modification time automatically. |
| `@Configuration` | Marks a class that configures Spring. |
| `@Bean` | Makes a returned object available for Spring to inject elsewhere. |
| `@Value` | Reads a value from `application.yml` or an environment variable. |
| `@RestControllerAdvice` | Handles exceptions from every controller in one place. |
| `@ExceptionHandler` | Chooses which exceptions a handler method receives. |
| `@AuthenticationPrincipal` | Provides the currently authenticated user or JWT. |

### Validation annotations

| Annotation | Rule |
| --- | --- |
| `@NotBlank` | Text must not be `null`, empty, or only spaces. |
| `@NotNull` | A value must be provided. |
| `@NotEmpty` | A collection must contain at least one item. |
| `@Email` | Text must have a valid email shape. |
| `@Size` | Limits text length or collection size. |
| `@Min` / `@Max` | Limits a whole number. |
| `@DecimalMin` / `@DecimalMax` | Limits a decimal number. |
| `@PositiveOrZero` | The number must be zero or positive. |

## 4. Dependency injection

Spring creates objects such as services and repositories. A class asks for the objects it
needs through its constructor:

```java
public ProductController(ProductService service) {
    this.service = service;
}
```

This is called **constructor dependency injection**. Spring sees that `ProductController`
needs a `ProductService`, creates it, and passes it to the constructor. This keeps object
creation out of the application logic and makes classes easier to test.

## 5. File and method reference

### Application entry point

`ReciptileApiApplication`

- `main(String[] args)` starts the embedded web server and creates the Spring application.

### Product feature

`ProductController` maps HTTP requests to product service methods.

- `findAll(String q)` returns all products or products whose names contain `q`.
- `findById(String id)` returns one product.
- `create(ProductRequest request)` creates a product and returns `201 Created`.
- `update(String id, ProductRequest request)` replaces the editable product values.
- `delete(String id)` deletes a product and returns `204 No Content`.

`ProductService` contains the product rules.

- `findAll(String query)` chooses between listing and name searching.
- `findById(String id)` loads a product or throws `ProductNotFoundException`.
- `create(ProductRequest request)` trims text, uses `DRAFT` when status is missing, and saves.
- `update(String id, ProductRequest request)` changes an existing product and saves it.
- `delete(String id)` checks that the product exists and then deletes it.

`ProductRepository` extends `MongoRepository<Product, String>`. Spring creates its
implementation automatically. `Product` is the document type and `String` is the ID type.

- `existsByNameIgnoreCase` checks for a name without caring about uppercase/lowercase.
- `findByNameContainingIgnoreCaseOrderByCreatedAtDesc` searches names and returns newest first.
- `findAllByOrderByCreatedAtDesc` lists every product, newest first.

`Product` represents a document in the `products` MongoDB collection. Its getters return
values and its setters change editable values. `ProductRequest` describes and validates the
JSON accepted when creating or updating a product. `ProductStatus` allows `ACTIVE` or `DRAFT`.

### Authentication feature

`AuthController` defines the authentication endpoints.

- `login(LoginRequest request)` checks a user's credentials.
- `register(RegisterRequest request)` creates a customer and returns `201 Created`.

`AuthService` contains the authentication rules.

- `registerCustomer(RegisterRequest request)` normalizes the email, rejects duplicates,
  hashes the password, saves a customer, and returns a token.
- `login(LoginRequest request)` finds the email and compares the submitted password with the
  saved hash.
- `response(AppUser user)` is a private helper that creates the token and safe user response.
- `normalizeEmail(String email)` is a private helper that trims and lowercases an email.

`JwtService.issue(AppUser user)` creates a signed JSON Web Token (JWT). The token contains the
user ID, name, email, location, role, issue time, and expiry time. A client sends it in later
requests as `Authorization: Bearer <token>`.

`UserRepository` provides user database operations. Its method names tell Spring which MongoDB
queries to generate. `AppUser` is the stored user document. `AuthResponse` deliberately sends
a user view without the password hash. `LoginRequest`, `RegisterRequest`, and
`BrowserLocation` describe and validate incoming JSON. `UserRole` allows `ADMIN` or `CUSTOMER`.

`AdminSeeder.run()` runs once during application startup. If the admin environment values are
present and the account does not exist, it saves the first administrator with a hashed password.

### Invoice feature

`InvoiceController` maps invoice HTTP requests to the invoice service.

- `findAll()` returns invoices from newest to oldest.
- `findById(String id)` returns one invoice.
- `create(InvoiceRequest request)` creates an invoice and returns `201 Created`.
- `delete(String id)` deletes an invoice and returns `204 No Content`.

`InvoiceService` contains invoice rules.

- `findAll()` loads invoices from newest to oldest.
- `findById(String id)` loads one invoice or throws `InvoiceNotFoundException`.
- `create(InvoiceRequest request)` validates the dates, loads each product, calculates each
  line total and the invoice total, snapshots product details, and saves a draft invoice.
- `delete(String id)` checks that the invoice exists and deletes it.
- `nextInvoiceNumber()` is a private helper that creates a number such as
  `INV-2026-A1B2C3`.

`InvoiceRepository` supplies the standard MongoDB operations plus invoice-number lookup and
newest-first listing. `Invoice` is the stored document. `InvoiceRequest` is the validated input.
`InvoiceItem` is a saved snapshot of a product line. `InvoiceStatus` contains `DRAFT`, `SENT`,
`PAID`, and `OVERDUE`.

Using `BigDecimal` for money avoids the rounding surprises that can happen with `double`.

### Checkout feature

`CheckoutController.prepare()` is available to authenticated customers. It validates that at
least one product ID was supplied and returns `READY` with the customer ID from the JWT. It does
not charge a card; it is only a preparation endpoint.

### Shared error handling

`ApiExceptionHandler` converts Java exceptions into consistent JSON error responses.

- `handleAuth` returns `401 Unauthorized`.
- `handleNotFound` and `handleInvoiceNotFound` return `404 Not Found`.
- `handleBadRequest` returns `400 Bad Request` for an invalid application rule.
- `handleValidation` returns `400 Bad Request` and lists invalid fields.
- `response` is a private helper that builds the common error JSON.

Because this logic is in one class, controllers do not need repeated `try/catch` blocks.

### Configuration

`SecurityConfig`

- `securityFilterChain` defines public URLs and which URLs require `ADMIN` or `CUSTOMER`.
- `passwordEncoder` creates BCrypt password hashing support.
- `jwtSecretKey` loads and checks the JWT signing secret.
- `jwtEncoder` creates tokens; `jwtDecoder` verifies incoming tokens.
- `jwtAuthenticationConverter` turns the token's `roles` claim into Spring roles.

`WebConfig.addCorsMappings()` allows the configured frontend origin to call `/api/**` from a
browser. CORS means Cross-Origin Resource Sharing.

`MongoConfig` enables automatic values for `@CreatedDate` and `@LastModifiedDate`.

`DemoDataSeeder.run()` adds sample products, customers, and invoices only when
`SEED_DATA=true`. Its private helper methods first check for existing data, so running it again
does not intentionally create duplicates.

## 6. Security rules at a glance

| URL | Who can use it |
| --- | --- |
| `/api/auth/**` | Everyone |
| `/actuator/health` | Everyone |
| `GET /api/products/**` | Everyone |
| Other `/api/products/**` requests | Admin only |
| `/api/invoices/**` | Admin only |
| `/api/checkout/**` | Customer only |
| Any other request | Any authenticated user |

The API is **stateless**: the server does not keep a login session. Each protected request must
contain a valid JWT.

## 7. Configuration definitions

`src/main/resources/application.yml` connects environment variables to Spring settings.

| Environment variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection address. |
| `MONGODB_DATABASE` | Database name; defaults to `reciptile`. |
| `PORT` | Server port; defaults to `8080`. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_LOCATION` | Values used to create the first admin. |
| `JWT_SECRET` | Secret used to sign and verify JWTs; must be at least 32 characters. |
| `JWT_HOURS` | Token lifetime; defaults to 8 hours. |
| `CORS_ALLOWED_ORIGINS` | Frontend origins allowed to call the API. |
| `SEED_DATA` | Adds demo data when set to `true`. |

## 8. How to trace a function yourself

When you want to understand an endpoint, use this repeatable process:

1. Find its URL in a controller annotation.
2. Read the controller method and note which service method it calls.
3. Read that service method from top to bottom.
4. Note every repository method it calls.
5. Look at the request record to see validation rules.
6. Look at the model class to see stored and returned fields.
7. Check `ApiExceptionHandler` to see how errors become HTTP responses.
8. Check `SecurityConfig` to see who is allowed to call the URL.

## 9. Tests

Run the backend tests from the `backend` directory:

```bash
./mvnw test
```

`ProductServiceTest` shows how a service can be tested without MongoDB by replacing the real
repository with a Mockito mock. `AuthServiceTest` does the same for the user repository,
password encoder, and JWT service.

Useful test annotations and functions:

| Item | Meaning |
| --- | --- |
| `@Test` | Marks a test function. |
| `@Mock` | Creates a fake dependency. |
| `@InjectMocks` | Creates the class being tested and supplies its mocks. |
| `when(...).thenReturn(...)` | Defines what a mock should return. |
| `verify(...)` | Confirms that a mock method was called. |
| `assertThat(...)` | Checks that the actual result matches the expected result. |

## 10. A good next exercise

Add an invoice update endpoint without changing several layers at once:

1. Write a failing `InvoiceServiceTest` for the rule you want.
2. Add an `update` method to `InvoiceService`.
3. Add `@PutMapping("/{id}")` to `InvoiceController`.
4. Run `./mvnw test`.

Following the existing pattern is the easiest way to learn this codebase safely.
