# RADASH

An application for monitoring and managing FreeRADIUS servers. Built with NestJS (backend) and Next.js (frontend) with Mantine UI components.

## Features

### Backend

-   User management: Create, update, and manage users on the RADIUS server.
-   NAS management: Add and manage NAS devices.
-   Real-time monitoring: Fetch and display real-time RADIUS server statistics (e.g., online - users, accounting logs).
-   Billing and subscriptions: Handle ISP billing and user subscriptions.
-   Authentication and Authorization:

    -   Admin and client roles.
    -   Token-based authentication using JWT.

-   Notifications:

    -   Notify NAS devices of configuration changes.

### Frontend

-   User-friendly dashboard with real-time charts and statistics.
-   Role-based access for administrators and clients.
-   CRUD operations for users, groups, and NAS devices.
-   Authentication with NextAuth for secure login.
-   Customizable UI built on Mantine UI for a modern, responsive experience.

## Tech Stack

### Backend

-   **Framework**: NestJS
-   **Database**: MySQL
-   **Payment**: M-PESA
-   **SMS**: Africa's Talking
-   **Authentication**: JWT
-   **Documentation**: Swagger/OpenAPI

### Frontend

-   **Framework**: Next.js 14
-   **UI Library**: Mantine UI
-   **State Management**: SWR
-   **Charts**: Mantine Charts(Recharts)

## Prerequisites

-   Docker
-   Docker Compose

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Ogwenya/radash.git
```

2. Configure environment variables:

-   Node

    -   `NODE_ENV`

-   Timezone

    -   `TIMEZONE_IANA`
    -   `TIMEZONE`

-   Raduis

    -   `RADIUS_SECRET`

-   JWT

    -   `JWT_SECRET`

-   Database

    -   `MYSQL_ROOT_PASSWORD`
    -   `MYSQL_USER`
    -   `MYSQL_PASSWORD`
    -   `MYSQL_DATABASE`

-   Email

    -   `EMAIL_ADDRESS`
    -   `EMAIL_PASSWORD`
    -   `EMAIL_HOST`
    -   `EMAIL_PORT`

-   SMS

    -   `AFRICAS_TALKING_API_KEY`
    -   `AFRICAS_TALKING_USERNAME`
    -   `AFRICAS_TALKING_SENDER_ID`

-   M-PESA

    -   `CALLBACK_URL`
    -   `MPESA_CONSUMER_KEY`
    -   `MPESA_SECRET_KEY`
    -   `MPESA_PAYBILL`
    -   `MPESA_PASSKEY`

-   Frontend

    -   `DASHBOARD_API_KEY`
    -   `DASHBOARD_URL`

-   Next-auth
    -   `NEXTAUTH_SECRET`
    -   `NEXTAUTH_URL`

3. Run docker-compose:

```bash
docker-compose up -d
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
