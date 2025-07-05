"use client";

import { useId } from "react";
import { HashLoader } from "react-spinners";

import { useMediaQuery } from "./useMediaQuery";

export default function Spinner({
  loading,
  size,
  overrideStyle,
  forcetheme,
}: {
  loading: boolean;
  size: number;
  overrideStyle?: React.CSSProperties;
  forcetheme?: "dark" | "light" | "dangerous" | string;
}) {
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  // react ID
  const id = useId();

  // bruh this spinner is so broken doesnt suport multiple instances of the same spinner

  // console.log("id", id);

  if (forcetheme === "dark") {
    return (
      <HashLoader
        cssOverride={overrideStyle}
        size={size}
        color="#f9f9f9"
        loading={loading}
        key={`spinner_black_${id}`}
      />
    );
  }

  if (forcetheme === "light") {
    return (
      <HashLoader
        cssOverride={overrideStyle}
        size={size}
        color="#1d1d1f"
        loading={loading}
        key={`spinner_white_${id}`}
      />
    );
  }

  if (forcetheme === "dangerous") {
    return (
      <HashLoader
        cssOverride={overrideStyle}
        size={size}
        color="rgb(255, 63, 63)"
        loading={loading}
        key={`spinner_dangerous_${id}`}
      />
    );
  }

  if (forcetheme) {
    return (
      <HashLoader
        cssOverride={overrideStyle}
        size={size}
        color={forcetheme}
        loading={loading}
        key={`spinner_custom_${id}`}
      />
    );
  }

  if (isDarkMode) {
    return (
      <HashLoader
        cssOverride={overrideStyle}
        size={size}
        color="#f9f9f9"
        loading={loading}
        key={`spinner_black_${id}`}
      />
    );
  }

  return (
    <HashLoader
      cssOverride={overrideStyle}
      size={size}
      color="#1d1d1f"
      loading={loading}
      key={`spinner_white_${id}`}
    />
  );
}
