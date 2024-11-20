## RADASH API

- **Framework**: NestJS
- **Database**: MySQL
- **Payment**: M-PESA
- **SMS**: Africa's Talking
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI

The API documentation is automatically generated using Swagger and is available at `/docs` when running the backend server.

the `/docs` endpoint is password protected in production, so make sure to provide `SWAGGER_PASSWORD` env variable.

Key API endpoints:

- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/clients` - RADIUS clients
- `/api/nas` - NAS devices
- `/api/logs` - Server logs
- `/api/stats` - Statistics and metrics
