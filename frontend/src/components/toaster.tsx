import { Toaster as ToasterComponent, ToasterProps } from "react-hot-toast";

import styles from "./toaster.module.css";

export default function Toaster({
  containerPosition = "fixed",
  ...props
}: ToasterProps & {
  containerPosition?: "fixed" | "absolute" | "relative" | "static";
}) {
  return (
    <ToasterComponent
      containerStyle={{
        position: containerPosition,
      }}
      toastOptions={{
        className: styles.toaster,
      }}
      {...props}
    />
  );
}
