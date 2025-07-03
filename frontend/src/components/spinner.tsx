"use client";

import { HashLoader } from "react-spinners";

import styles from "./spinner.module.css";

import { useMediaQuery } from "./useMediaQuery";

export default function Spinner({
  loading,
  size,
  overrideStyle,
}: {
  loading: boolean;
  size: number;
  overrideStyle?: React.CSSProperties;
}) {
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  if (isDarkMode) {
    return (
      <HashLoader
        cssOverride={overrideStyle}
        size={size}
        color="#f9f9f9"
        loading={loading}
        key="spinner_black"
      />
    );
  }

  return (
    <HashLoader
      cssOverride={overrideStyle}
      size={size}
      color="#1d1d1f"
      loading={loading}
      key="spinner"
    />
  );
}
