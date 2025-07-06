"use client";

import { useSearchParams } from "next/navigation";

import Error from "@/components/error";

export default function ErrorPage() {
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
