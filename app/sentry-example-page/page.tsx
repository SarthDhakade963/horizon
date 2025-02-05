"use client"

// pages/sentry-example-page.tsx
import * as Sentry from "@sentry/nextjs";
import { NextPage } from "next";
import { useState } from "react";

const SentryExamplePage: NextPage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleError = async () => {
    await Sentry.startSpan({
      name : 'Example Frontend Span',
      op : 'test'
    }, async () => {
      const res = await fetch("/pages/api/sentry-example-api");
      if(!res.ok) {
        throw new Error("Sentry Example Front end error")
      }
    })
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Sentry Example Page</h1>
      <p className="mb-4">Click the button below to trigger an error and send it to Sentry.</p>
      
      <button
        onClick={handleError}
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
      >
        Trigger Error
      </button>

      {errorMessage && <p className="mt-4 text-red-600">{errorMessage}</p>}
    </div>
  );
};

export default SentryExamplePage;
