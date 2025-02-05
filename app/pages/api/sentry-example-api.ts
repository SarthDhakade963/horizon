import { NextApiRequest, NextApiResponse } from "next";
import * as Sentry from "@sentry/nextjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    throw new Error("This is a test error for Sentry!");
  } catch (error) {
    Sentry.captureException(error);
    await Sentry.flush(2000); // Ensures the error is sent before response
    res.status(500).json({ message: "An error occurred", error: error });
  }
}
