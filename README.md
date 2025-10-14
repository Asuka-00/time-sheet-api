# Time Sheet API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A comprehensive timesheet management system built with NestJS, TypeORM, and supporting multiple
databases.

## 📖 Description

Time Sheet API is a RESTful backend service for managing employee timesheets, projects, and work
hours. It features a robust authentication system, role-based access control, and support for
multiple database types.

### Key Features

- ✅ **Multi-database Support**: SQLite, MySQL, PostgreSQL, Oracle
- ✅ **JWT Authentication**: Dual-token system (Access + Refresh tokens)
- ✅ **Role-Based Access Control (RBAC)**: Fine-grained permissions management
- ✅ **Audit Logging**: Automatic tracking of data changes with user context
- ✅ **Swagger Documentation**: Interactive API documentation
- ✅ **TypeScript**: Full type safety and modern development experience
- ✅ **Modular Architecture**: Clean, maintainable code structure

## 🛠️ Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **ORM**: TypeORM 0.3.x
- **Authentication**: JWT with Passport
- **Password Hashing**: Argon2
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Database**: SQLite (default), MySQL, PostgreSQL, Oracle

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 or yarn
- Database (SQLite is included, MySQL/PostgreSQL/Oracle optional)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd time-sheet-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Install database driver**

This project supports multiple databases. Database drivers are set as optional dependencies. Install
the driver for your database type:

```bash
# MySQL (recommended for production)
npm install mysql2

# PostgreSQL
npm install pg

# SQLite (recommended for development/testing)
npm install sqlite3

# Oracle (enterprise applications)
npm install oracledb
```

**Note**:

- If deploying with Docker, drivers are installed automatically
- SQLite may require compilation in some environments; if issues occur, use MySQL or PostgreSQL
  instead

4. **Configure environment variables**

Copy the example environment file and configure it:

```bash
# Windows
copy .env.example .env

# Linux/macOS
cp .env.example .env
```

Edit `.env` file with your configuration (see Configuration section below).

5. **Start the development server**

```bash
npm run start:dev
```

The server will start at `http://localhost:8090` (or your configured PORT).

6. **Access Swagger Documentation**

Open your browser and navigate to: `http://localhost:8090/api`

## 📁 Project Structure

```
time-sheet-api/
├── src/
│   ├── modules/              # Business modules
│   │   ├── auth/            # Authentication & Authorization
│   │   │   ├── decorators/  # Custom decorators (Public, CurrentUser, etc.)
│   │   │   ├── dto/         # Auth DTOs (Login, Register, etc.)
│   │   │   ├── guards/      # JWT guards
│   │   │   └── strategies/  # Passport strategies (JWT Access, Refresh)
│   │   ├── users/           # User management
│   │   ├── roles/           # Role management
│   │   ├── permissions/     # Permission management
│   │   ├── departments/     # Department management
│   │   ├── projects/        # Project management
│   │   └── timesheets/      # Timesheet management
│   ├── common/              # Shared utilities
│   │   ├── constants/       # Application constants & error codes
│   │   ├── context/         # Request context service
│   │   ├── decorators/      # Custom decorators
│   │   ├── dto/             # Base DTOs (Pagination, etc.)
│   │   ├── exceptions/      # Custom exceptions
│   │   ├── filters/         # Exception filters
│   │   ├── interceptors/    # Request/Response interceptors
│   │   └── subscribers/     # TypeORM subscribers (Audit logging)
│   ├── config/              # Configuration files
│   │   └── database.config.ts  # Database configuration factory
│   ├── app.module.ts        # Root module
│   ├── app.controller.ts    # Root controller
│   ├── app.service.ts       # Root service
│   └── main.ts              # Application entry point
├── test/                    # E2E tests
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Environment variables template
├── database.sqlite          # SQLite database (auto-generated)
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## ⚙️ Configuration

### Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env` and
configure the following:

### Database Configuration

#### SQLite (Default)

```env
DB_TYPE=sqlite
DATABASE_PATH=./database.sqlite
DB_SYNCHRONIZE=true
DB_LOGGING=true
```

The SQLite database file will be automatically created on first run.

#### MySQL

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=timesheet
DB_SYNCHRONIZE=true
DB_LOGGING=true
```

**Note**: Ensure MySQL is installed and running. The driver is already included.

#### PostgreSQL

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=timesheet
DB_SYNCHRONIZE=true
DB_LOGGING=true
```

**Note**: Ensure PostgreSQL is installed and running. The driver is already included.

#### Oracle

```env
DB_TYPE=oracle
DB_HOST=localhost
DB_PORT=1521
DB_USERNAME=system
DB_PASSWORD=your_password
DB_DATABASE=xe
DB_SYNCHRONIZE=false
DB_LOGGING=true
```

**Note**: Oracle client libraries are required. See
[node-oracledb documentation](https://node-oracledb.readthedocs.io/).

### JWT Configuration

The application uses a dual-token authentication system:

#### Access Token

- **Purpose**: API authentication
- **Lifetime**: 30 minutes (default)
- **Storage**: Client memory or short-term storage

#### Refresh Token

- **Purpose**: Refresh access tokens
- **Lifetime**: 7 days (default)
- **Storage**: Secure HTTP-only cookie (recommended)

```env
# Access Token Configuration
JWT_ACCESS_SECRET=your-secure-access-secret-change-in-production
JWT_ACCESS_EXPIRATION=30m

# Refresh Token Configuration
JWT_REFRESH_SECRET=your-secure-refresh-secret-change-in-production
JWT_REFRESH_EXPIRATION=7d
```

**Security Recommendations**:

1. Use strong, randomly generated secrets in production
2. Access and Refresh secrets MUST be different
3. Rotate secrets periodically
4. Never commit secrets to version control

### CORS Configuration

Configure Cross-Origin Resource Sharing for your frontend applications:

```env
# Allowed origins (comma-separated, or * for all)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Allow credentials (cookies, authorization headers)
CORS_CREDENTIALS=true
```

**Development vs Production**:

- Development: Can use `CORS_ORIGIN=*` for convenience
- Production: Always specify exact frontend URLs

### Server Configuration

```env
# Server port
PORT=8090

# Development mode (enables additional logging and features)
DEV_MODE=true

# Development token (only for development, disable in production)
DEV_TOKEN=dev-token-2024
```

### Environment Variables Reference

| Variable                 | Description                                     | Default           | Required            |
| ------------------------ | ----------------------------------------------- | ----------------- | ------------------- |
| `DB_TYPE`                | Database type (sqlite\|mysql\|postgres\|oracle) | sqlite            | No                  |
| `DB_HOST`                | Database host                                   | localhost         | For MySQL/PG/Oracle |
| `DB_PORT`                | Database port                                   | 3306/5432/1521    | For MySQL/PG/Oracle |
| `DB_USERNAME`            | Database username                               | -                 | For MySQL/PG/Oracle |
| `DB_PASSWORD`            | Database password                               | -                 | For MySQL/PG/Oracle |
| `DB_DATABASE`            | Database name/SID                               | timesheet         | For MySQL/PG/Oracle |
| `DATABASE_PATH`          | SQLite file path                                | ./database.sqlite | For SQLite          |
| `DB_SYNCHRONIZE`         | Auto-sync schema                                | true              | No                  |
| `DB_LOGGING`             | Enable SQL logging                              | true              | No                  |
| `JWT_ACCESS_SECRET`      | Access token secret                             | -                 | Yes                 |
| `JWT_ACCESS_EXPIRATION`  | Access token lifetime                           | 30m               | No                  |
| `JWT_REFRESH_SECRET`     | Refresh token secret                            | -                 | Yes                 |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifetime                          | 7d                | No                  |
| `PORT`                   | Server port                                     | 8090              | No                  |
| `CORS_ORIGIN`            | Allowed origins                                 | \*                | No                  |
| `CORS_CREDENTIALS`       | Allow credentials                               | false             | No                  |
| `DEV_MODE`               | Development mode                                | false             | No                  |
| `DEV_TOKEN`              | Development token                               | -                 | No                  |

## 📚 API Documentation

### Swagger UI

After starting the server, access the interactive API documentation at:

- **Development**: `http://localhost:8090/api`
- **Production**: `http://your-domain/api`

### Main Endpoints

#### Authentication

- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `POST /auth/register` - Register new user

#### User Management

- `GET /users` - Get user list (with pagination)
- `POST /users` - Create user
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Role Management

- `GET /roles` - Get role list
- `POST /roles` - Create role
- `GET /roles/:id` - Get role details
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

#### Project Management

- `GET /projects` - Get project list
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

#### Timesheet Management

- `GET /timesheets` - Get timesheet records
- `POST /timesheets` - Create timesheet entry
- `GET /timesheets/:id` - Get timesheet details
- `PUT /timesheets/:id` - Update timesheet
- `DELETE /timesheets/:id` - Delete timesheet
- `POST /timesheets/:id/submit` - Submit for approval
- `POST /timesheets/:id/approve` - Approve timesheet

## 🔐 Authentication Flow

1. **Login**: Send credentials to `/auth/login`
    - Returns: Access Token (short-lived) + Refresh Token (long-lived)

2. **API Requests**: Include Access Token in Authorization header
    - Format: `Authorization: Bearer <access_token>`

3. **Token Refresh**: When Access Token expires, use Refresh Token at `/auth/refresh`
    - Returns: New Access Token + New Refresh Token

4. **Logout**: Call `/auth/logout` to invalidate tokens

## 🛠️ Development

### Available Scripts

```bash
# Development mode (with hot reload)
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Lint code
npm run lint:check

# Lint and auto-fix
npm run lint

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

### Code Standards

- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with custom configuration
- **Commit**: Run `npm run lint` and `npm run format` before committing

### Recommended Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation updates
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test-related changes
- `chore:` Build/tooling changes

## 📦 Production Deployment

### Docker Deployment (Recommended)

The project is configured with Docker and Docker Compose for one-command deployment.

#### Database Driver Configuration

Configure the database driver in `docker-compose.yml` (MySQL is configured by default):

```yaml
app:
    build:
        context: .
        dockerfile: Dockerfile
        args:
            DB_DRIVER: mysql2 # Options: mysql2, pg, sqlite3, oracledb
```

**Supported Database Drivers**:

- `mysql2` - MySQL database (default)
- `pg` - PostgreSQL database
- `sqlite3` - SQLite database
- `oracledb` - Oracle database

#### Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

#### Custom Build

To specify a database driver during build:

```bash
# Build with MySQL driver
docker build --build-arg DB_DRIVER=mysql2 -t timesheet-api .

# Build with PostgreSQL driver
docker build --build-arg DB_DRIVER=pg -t timesheet-api .
```

### Manual Deployment

#### Build

```bash
npm run build
```

The compiled output will be in the `dist/` directory.

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong secrets for JWT tokens
3. Set `DB_SYNCHRONIZE=false` (use migrations instead)
4. Configure specific CORS origins
5. Disable `DEV_MODE`
6. Use environment-specific database credentials

### Running in Production

```bash
npm run start:prod
```

Or use a process manager like PM2:

```bash
pm2 start dist/main.js --name time-sheet-api
```

## 🐛 Troubleshooting

### Database Connection Failed

**Issue**: Application fails to connect to database

**Solutions**:

- Verify database credentials in `.env`
- Ensure database server is running
- Check firewall settings
- Verify database exists (for MySQL/PostgreSQL)

### JWT Authentication Errors

**Issue**: API returns 401 Unauthorized

**Solutions**:

- Check if token has expired
- Verify `JWT_ACCESS_SECRET` is correctly set
- Ensure Authorization header format: `Bearer <token>`
- Try refreshing the token using `/auth/refresh`

### CORS Errors

**Issue**: Frontend requests blocked by CORS policy

**Solutions**:

- Add frontend URL to `CORS_ORIGIN` in `.env`
- Set `CORS_CREDENTIALS=true` if using cookies
- Development: Can use `CORS_ORIGIN=*` temporarily
- Production: Always specify exact origins

### Port Already in Use

**Issue**: Error: Port 8090 is already in use

**Solutions**:

- Change `PORT` in `.env` to a different value
- Stop other applications using port 8090
- Find and kill process: `npx kill-port 8090`

## 📄 License

This project is [UNLICENSED](LICENSE).

## 🤝 Support

For issues and questions:

- Check the [Troubleshooting](#-troubleshooting) section
- Review [Swagger Documentation](http://localhost:8090/api)
- Open an issue on GitHub

## 🔗 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Swagger/OpenAPI](https://swagger.io/specification/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Built with ❤️ using NestJS**
