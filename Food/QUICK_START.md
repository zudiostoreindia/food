# Food Ordering System - Quick Start Guide

This guide will help you quickly set up and run the Food Ordering System on your local machine or server.

## Prerequisites

Before starting, ensure you have the following installed:
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- MongoDB (v4.0 or higher)

## Installation Steps

### 1. Clone or download the project

Download the project files to your local machine or server.

### 2. Install Backend Dependencies

```bash
cd /path/to/Food/backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd /path/to/Food/frontend
npm install
```

### 4. Install Setup Wizard Dependencies

```bash
cd /path/to/Food/setup
npm install
```

### 5. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cd /path/to/Food/backend
cp .env.example .env
```

Edit the `.env` file to match your environment:
- Set `MONGODB_URI` to your MongoDB connection string
- Set `JWT_SECRET` to a secure random string
- Set `FRONTEND_URL` to your frontend URL (default: http://localhost:3000)

### 6. Run the Setup Wizard (Optional)

If you prefer to use the setup wizard instead of manual configuration:

```bash
cd /path/to/Food/setup
node index.js
```

Then open your browser and navigate to `http://localhost:3000` to complete the setup.

### 7. Start the Backend Server

```bash
cd /path/to/Food/backend
npm run dev
```

The backend server will start on port 5000 by default.

### 8. Start the Frontend Development Server

```bash
cd /path/to/Food/frontend
npm run dev
```

The frontend development server will start on port 3000 by default.

### 9. Access the Application

Open your browser and navigate to `http://localhost:3000` to access the Food Ordering System.

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors related to missing modules like React or Axios, ensure you've run `npm install` in the frontend directory. These errors occur because the TypeScript compiler can't find the type definitions for these modules.

### MongoDB Connection Issues

If you encounter MongoDB connection issues:
1. Ensure MongoDB is running
2. Check your connection string in the `.env` file
3. Verify network connectivity between your application and MongoDB

### Port Conflicts

If ports 3000 or 5000 are already in use:
1. For the backend, modify the `PORT` variable in the `.env` file
2. For the frontend, use `npm run dev -- -p <port>` to specify a different port

## Production Deployment

For production deployment, refer to the detailed [INSTALLATION.md](./INSTALLATION.md) guide, which includes:
- Shared hosting instructions
- Production build steps
- Security considerations
- Performance optimization tips

## Additional Resources

- [Complete Documentation](./README.md)
- [API Documentation](./API_DOCS.md) (if available)
- [Troubleshooting Guide](./TROUBLESHOOTING.md) (if available)
