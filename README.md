# WorkspaceHub

WorkspaceHub is a full-stack project and task tracker for teams, built with TypeScript on both the client and server. Each organization has its own members, roles, projects, tasks, comments, and bookings. Owners and admins can turn features on or off for their organization.

Live app: https://ai-se-project-workspacehub-2iqe-git-workspa-73b34f-codebase-013.vercel.app

## Features

- Sign up, log in, and stay signed in with JWT authentication
- Organizations with owner, admin, and member roles that control who can manage what
- Projects and tasks, with status, priority, assignee, and due date
- Comments on tasks: members can add comments, edit or delete their own, and owners and admins can manage any comment
- Bookings with start and end times that reject overlapping slots (enabled by the scheduling feature flag)
- Per-organization feature flags that owners and admins can toggle
- Form validation with clear error messages
- Responsive layout with a collapsible header menu on small screens

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT authentication
- Context API for client state
- Vercel for hosting the client and server

## Project Structure

```text
workspacehub/
  client/
  server/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment examples and fill them in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Recommended local values:

```env
# server/.env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/workspacehub
JWT_SECRET=super-secret-jwt-key
CLIENT_ORIGIN=http://localhost:5173
```

```env
# client/.env
VITE_API_URL=http://localhost:5001
```

3. Start MongoDB locally or point `MONGODB_URI` at an existing instance.

4. Seed demo data:

```bash
npm run seed
```

5. Run the server and client in separate terminals:

```bash
npm run dev:server
npm run dev:client
```

## Environment Variables

| Variable        | Used by | Required | Description                                                                                                                      |
| --------------- | ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`          | server  | No       | Port for the local API server. Defaults to `5001`. Not needed on Vercel.                                                         |
| `MONGODB_URI`   | server  | Yes      | MongoDB connection string: a local instance in development, MongoDB Atlas in production.                                         |
| `JWT_SECRET`    | server  | Yes      | Secret used to sign and verify login tokens. Use a long random value in production.                                              |
| `CLIENT_ORIGIN` | server  | Yes      | The frontend's origin allowed by CORS, with no trailing slash.                                                                   |
| `VITE_API_URL`  | client  | No       | Base URL of the API, without `/api`. Defaults to `http://localhost:5001`. Baked in at build time, so redeploy after changing it. |

In production, these values are set in each Vercel project's environment variables, never committed to the repository.

## Demo Users

The seed script creates one organization with these users:

- `owner@workspacehub.dev` / `Password123!`
- `admin@workspacehub.dev` / `Password123!`
- `member@workspacehub.dev` / `Password123!`

## Scripts

- `npm run dev:server`
- `npm run dev:client`
- `npm run build`
- `npm run seed`

## Notes

- All protected API responses follow the same JSON envelope:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

- The booking overlap rule is isolated in the booking service.
- Feature-flag checks are isolated in a reusable middleware/service path.
- Permission logic is centralized in auth and permission helpers.
