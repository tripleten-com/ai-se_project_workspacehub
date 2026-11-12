import app from "./app";
import { connectToDatabase } from "./config/database";
import { env } from "./config/env";

const start = async () => {
  await connectToDatabase();

  const server = app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${env.port} is already in use. Update server/.env with a different PORT value.`,
      );
      process.exit(1);
    }

    throw error;
  });
};

void start();
