# Copilot instructions for WorkspaceHub

WorkspaceHub is a full-stack project and task tracker: an Express/Mongoose API and a React/Vite frontend, run as an npm workspaces monorepo (`client/`, `server/`).

## Tech stack

- Backend: Express, Mongoose (MongoDB), TypeScript, JWT authentication (`requireAuth` middleware).
- Frontend: React, React Router, Tailwind CSS, Axios.
- Tooling: ESLint 9 flat config and Prettier across both workspaces.

## Project structure

- `server/src/models/`: Mongoose schemas. Derive document types with `InferSchemaType<typeof schema> & { _id: Types.ObjectId }`; do not hand-write matching interfaces. Register models using the document type parameter, for example `model<TaskDocument>("Task", taskSchema)`.
- `server/src/routes/` -> `server/src/controllers/` -> `server/src/services/`: routes wire middleware and call `asyncHandler(controller)`; controllers extract request data, call services, and respond with `sendSuccess(res, data)`; services own business logic, database calls, and permission checks.
- `server/src/services/permissionService.ts`: backend `canManage*` authorization checks belong here, not in individual controllers.
- `client/src/types/models.ts`: frontend model and payload types. Update payloads are `Partial<CreatePayload>`, derived from the narrower create payload, never `Partial` of the full model.
- `client/src/services/*Service.ts`: resource API functions use `unwrapResponse`.
- `client/src/pages/` and `client/src/components/`: pages own data loading and state; components receive data as props.

## Conventions

- Scope tenant-owned documents and queries to `organizationId`.
- Frontend permission helpers in `client/src/utils/permissions.ts` mirror backend rules for UX only. Backend authorization is the security boundary and must exist independently.
- Do not add a database field or endpoint for data the frontend can derive from data it already has.
- When writing functions, add descriptive JSDoc comments, validate inputs, use early returns for error conditions, choose meaningful variable names, and include at least one example usage in comments.

## Build, test, and validate

- `npm run dev:server` and `npm run dev:client`: start the two development servers in separate terminals.
- `npm run seed`: reseed demo data. The seeded users are `owner@workspacehub.dev`, `admin@workspacehub.dev`, and `member@workspacehub.dev`; their password is `Password123!`.
- `npm run typecheck`: type-check both workspaces. Use `npm run typecheck --workspace client` or `npm run typecheck --workspace server` to scope it.
- `npm run lint`, `npm run format`, and `npm run format:check`: run across both workspaces from the repository root.

## Where to look first

- `server/src/app.ts`: middleware and route mounting.
- `server/src/routes/taskRoutes.ts`, `server/src/controllers/taskController.ts`, and `server/src/services/taskService.ts`: reference slice for the backend three-layer pattern.
- `client/src/pages/TasksPage.tsx`: reference for data loading, Tailwind conventions, and permission-gated UI.

## Conditional constraints

For frontend work:

- Do not modify the backend unless explicitly asked.
- Do not change the shape of existing types unless explicitly asked.
- Handle async UI states distinctly and in context:
  1. **Loading:** the initial request is still in progress.
  2. **Load error:** the initial request failed, so the page cannot safely show the ready UI.
  3. **Empty success:** the request succeeded, but there are no items to show.
  4. **Ready success:** the request succeeded, and there are items to show.
  5. **Action error:** the page is usable, but a later create, update, or delete action failed.

For mock and test data:

- Do not invent fields or include backend-only fields such as `passwordHash`.
- Use `_id`, not `id`.
- Include all required fields and use valid constrained values, such as the allowed status strings.
- Relationship fields such as `projectId` must point to the correct kind of record.
- Date fields must use the serialized string format expected by the frontend.
