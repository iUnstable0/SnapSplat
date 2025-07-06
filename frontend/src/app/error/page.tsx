"use client";

import { Suspense } from "react";

import { useSearchParams } from "next/navigation";

import Error from "@/components/error";

function ErrorComponent() {
  const searchParams = useSearchParams();

  const status = searchParams.get("status");
  const message = searchParams.get("message");
  const redir = searchParams.get("redir");

  return (
    <Error
      title={status ?? "Error"}
      description={message ?? "An unexpected occurred"}
      link={{ label: "Go to home", href: redir ? redir : "/app/me" }}
    />
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <Error
          title={"Loading..."}
          description={"Loading..."}
          link={{ label: "Loading...", href: "#" }}
        />
      }
    >
      <ErrorComponent />
    </Suspense>
  );
}
