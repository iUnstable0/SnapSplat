"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Image from "next/image";

import clsx from "clsx";

import { AnimatePresence, motion } from "motion/react";

import register from "@/actions/user/register";

import styles from "./page.module.css";

import { TextMorph } from "@/components/ui/mp_text-morph";
import { Magnetic } from "@/components/ui/mp_magnetic";
import Keybind, { KeybindButton, T_Keybind } from "@/components/keybind";
import Spinner from "@/components/spinner";

import { Z_DisplayName, Z_Email, Z_Password } from "@/modules/parser";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [actionDisabled, setActionDisabled] = useState(false);

  const [blurOverlayOpen, setBlurOverlayOpen] = useState(true);
  const [formVisible, setFormVisible] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  const [issues, setIssues] = useState<{
    displayName: {
      success: boolean;
      reasons: string[];
    };
    email: {
      success: boolean;
      reasons: string[];
    };
    password: {
      success: boolean;
      reasons: string[];
    };
    confirmPassword: {
      success: boolean;
      reasons: string[];
    };
  }>({
    displayName: { success: true, reasons: [] },
    email: { success: true, reasons: [] },
    password: { success: true, reasons: [] },
    confirmPassword: { success: true, reasons: [] },
  });

  const displayNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only focus on the first issue

    if (!issues.displayName.success) {
      displayNameRef.current?.focus();
      return;
    }

    if (!issues.email.success) {
      emailRef.current?.focus();
      return;
    }

    if (!issues.password.success) {
      passwordRef.current?.focus();
      return;
    }

    // if (!issues.confirmPassword.success) {
    //   confirmPasswordRef.current?.focus();
    //   return;
    // }
  }, [issues]);

  const checkDisplayNameIssues = async () => {
    const displayName = displayNameRef.current?.value;

    const displayNameResult = Z_DisplayName.safeParse(displayName);

    if (!displayNameResult.success) {
      let reasons = [];

      if (!displayName) {
        reasons = ["Display name is required"];
      } else {
        reasons = displayNameResult.error.issues.map((issue) => issue.message);
      }

      setIssues((prev) => ({
        ...prev,
        displayName: {
          success: false,
          reasons: reasons,
        },
      }));

      return { success: false, data: displayNameResult.data };
    }

    setIssues((prev) => ({
      ...prev,
      displayName: {
        success: true,
        reasons: [],
      },
    }));

    return { success: true, data: displayNameResult.data };
  };

  const checkEmailIssues = async () => {
    const email = emailRef.current?.value;

    const emailResult = Z_Email.safeParse(email);

    if (!emailResult.success) {
      let reasons = [];

      if (!email) {
        reasons = ["Email is required"];
      } else {
        reasons = emailResult.error.issues.map((issue) => issue.message);
      }

      setIssues((prev) => ({
        ...prev,
        email: {
          success: false,
          reasons: reasons,
        },
      }));

      return { success: false, data: emailResult.data };
    }

    setIssues((prev) => ({
      ...prev,
      email: {
        success: true,
        reasons: [],
      },
    }));

    return { success: true, data: emailResult.data };
  };

  const checkPasswordIssues = async () => {
    const password = passwordRef.current?.value;

    const passwordResult = Z_Password.safeParse(password);

    if (!passwordResult.success) {
      let reasons = [];

      if (!password) {
        reasons = ["Password is required"];
      } else {
        reasons = passwordResult.error.issues.map((issue) => issue.message);
      }
      setIssues((prev) => ({
        ...prev,
        password: {
          success: false,
          reasons: reasons,
        },
      }));

      return { success: false, data: passwordResult.data };
    }

    setIssues((prev) => ({
      ...prev,
      password: {
        success: true,
        reasons: [],
      },
    }));

    return { success: true, data: passwordResult.data };
  };

  const checkConfirmPasswordIssues = async () => {
    const password = passwordRef.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;

    // Here just check if confirmPassword matches password

    if (confirmPassword !== password) {
      setIssues((prev) => ({
        ...prev,
        confirmPassword: {
          success: false,
          reasons: ["Passwords do not match"],
        },
      }));

      return { success: false, data: confirmPassword };
    }

    setIssues((prev) => ({
      ...prev,
      confirmPassword: {
        success: true,
        reasons: [],
      },
    }));

    return { success: true, data: confirmPassword };
  };

  const checkFormIssues = async () => {
    const displayNameResult = await checkDisplayNameIssues();
    const emailResult = await checkEmailIssues();
    const passwordResult = await checkPasswordIssues();
    const confirmPasswordResult = await checkConfirmPasswordIssues();

    if (
      !displayNameResult.success ||
      !emailResult.success ||
      !passwordResult.success ||
      !confirmPasswordResult.success
    ) {
      return {
        success: false,
        displayName: displayNameResult.data,
        email: emailResult.data,
        password: passwordResult.data,
        confirmPassword: confirmPasswordResult.data,
      };
    }

    return {
      success: true,
      displayName: displayNameResult.data,
      email: emailResult.data,
      password: passwordResult.data,
      confirmPassword: confirmPasswordResult.data,
    };
  };

  const _register = async () => {
    const {
      success: checkSuccess,
      displayName,
      email,
      password,
    } = await checkFormIssues();

    if (!checkSuccess) {
      return;
    }

    setActionDisabled(true);

    // setIssues({
    //   ...issues,
    //   password: {
    //     success: false,
    //     reasons: ["test"],
    //   },
    // });

    const result = await register(
      "captchaDemo",
      displayName!,
      email!,
      password!
    );

    setTimeout(() => {
      setActionDisabled(false);

      if (result.success) {
        const redir = searchParams.get("redir");

        if (redir) {
          setFormVisible(false);
          setRedirecting(true);

          setTimeout(() => {
            router.push(decodeURIComponent(redir));
          }, 1000);
        } else {
          setBlurOverlayOpen(false);

          setTimeout(() => {
            router.push("/app/me");
          }, 250);
        }
      } else {
        setIssues((prev) => ({
          ...prev,
          confirmPassword: {
            success: false,
            reasons: [result.message],
          },
        }));
      }
    }, 1000);
  };

  const calculateIssueMargin = (reasons: string[], isLast: boolean = false) => {
    return `${reasons.length * 32 + (isLast ? 16 : 0)}px`;
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContainer}>
        <AnimatePresence>
          {blurOverlayOpen && (
            <motion.div
              key="blurOverlay"
              className={styles.blurOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            />
          )}

          {blurOverlayOpen && redirecting && (
            <motion.div
              key="redirecting"
              className={styles.overlayContent}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 10,
              }}
            >
              <div className={styles.redirectingContainer}>
                <Spinner loading={redirecting} size={24} />
                <div className={styles.redirectingText}>Redirecting...</div>
              </div>
            </motion.div>
          )}

          {blurOverlayOpen && formVisible && (
            <motion.div
              key="form"
              className={styles.overlayContent}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 10,
              }}
            >
              <motion.div layout>
                <div className={styles.platformIcon}>
                  <Image
                    src="/snapsplat-transparent-removebg.png"
                    alt="Google"
                    width={340}
                    height={340}
                  />
                </div>
                <div className={styles.platformName}>SnapSplat</div>
                <div className={styles.platformDescription}>
                  Create your SnapSplat account to continue
                </div>
              </motion.div>

              <motion.div className={styles.inputContainer} layout>
                <input
                  type="text"
                  placeholder="Display Name"
                  className={clsx(
                    styles.input,
                    !issues.displayName.success && styles.inputInvalid
                  )}
                  onChange={checkDisplayNameIssues}
                  onBlur={checkDisplayNameIssues}
                  onKeyDown={(e) => {
                    e.stopPropagation();

                    if (e.key === "Enter") {
                      passwordRef.current?.focus();
                    }
                  }}
                  required
                  disabled={actionDisabled}
                  ref={displayNameRef}
                />
                <AnimatePresence mode="popLayout">
                  {!issues.displayName.success &&
                    issues.displayName.reasons.map((reason, index) => (
                      <motion.div
                        key={`displayNameIssues-${index}`}
                        className={styles.inputInvalidText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.2,
                          ease: "easeInOut",
                        }}
                      >
                        {/* <TextMorph>{reason}</TextMorph> */}
                        {reason}
                      </motion.div>
                    ))}
                </AnimatePresence>
              </motion.div>

              <motion.div
                className={styles.inputContainer}
                layout
                style={{
                  marginTop: issues.displayName.success
                    ? "8px"
                    : calculateIssueMargin(issues.displayName.reasons),
                }}
              >
                <input
                  type="text"
                  placeholder="Email"
                  className={clsx(
                    styles.input,
                    !issues.email.success && styles.inputInvalid
                  )}
                  onChange={checkEmailIssues}
                  onBlur={checkEmailIssues}
                  onKeyDown={(e) => {
                    e.stopPropagation();

                    if (e.key === "Enter") {
                      passwordRef.current?.focus();
                    }
                  }}
                  required
                  disabled={actionDisabled}
                  ref={emailRef}
                />
                <AnimatePresence mode="popLayout">
                  {!issues.email.success &&
                    issues.email.reasons.map((reason, index) => (
                      <motion.div
                        key={`emailIssues-${index}`}
                        className={styles.inputInvalidText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.2,
                          ease: "easeInOut",
                        }}
                      >
                        {/* <TextMorph>{reason}</TextMorph> */}
                        {reason}
                      </motion.div>
                    ))}
                </AnimatePresence>
              </motion.div>

              <motion.div
                className={styles.inputContainer}
                layout
                style={{
                  marginTop: issues.email.success
                    ? "8px"
                    : calculateIssueMargin(issues.email.reasons),
                }}
              >
                <motion.input
                  layout={false}
                  type="password"
                  placeholder="Password"
                  className={clsx(
                    styles.input,
                    !issues.password.success && styles.inputInvalid
                  )}
                  onChange={() => {
                    checkPasswordIssues();
                    checkConfirmPasswordIssues();
                  }}
                  onBlur={() => {
                    checkPasswordIssues();
                    checkConfirmPasswordIssues();
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") {
                      e.stopPropagation();
                    }
                  }}
                  required
                  disabled={actionDisabled}
                  ref={passwordRef}
                />

                <AnimatePresence mode="popLayout">
                  {!issues.password.success &&
                    issues.password.reasons.map((reason, index) => (
                      <motion.div
                        key={`passwordIssues-${index}`}
                        className={styles.inputInvalidText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.2,
                          ease: "easeInOut",
                        }}
                      >
                        {/* <TextMorph>{reason}</TextMorph> */}
                        {reason}
                      </motion.div>
                    ))}
                </AnimatePresence>
              </motion.div>

              <motion.div
                className={styles.inputContainer}
                layout
                style={{
                  marginTop: issues.password.success
                    ? "8px"
                    : calculateIssueMargin(issues.password.reasons),
                }}
              >
                <motion.input
                  layout={false}
                  type="password"
                  placeholder="Confirm Password"
                  className={clsx(
                    styles.input,
                    !issues.confirmPassword.success && styles.inputInvalid
                  )}
                  onChange={checkConfirmPasswordIssues}
                  onBlur={checkConfirmPasswordIssues}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") {
                      e.stopPropagation();
                    }
                  }}
                  required
                  disabled={actionDisabled}
                  ref={confirmPasswordRef}
                />

                <AnimatePresence mode="popLayout">
                  {!issues.confirmPassword.success &&
                    issues.confirmPassword.reasons.map((reason, index) => (
                      <motion.div
                        key={`confirmPasswordIssues-${index}`}
                        className={styles.inputInvalidText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.2,
                          ease: "easeInOut",
                        }}
                      >
                        {/* <TextMorph>{reason}</TextMorph> */}
                        {reason}
                      </motion.div>
                    ))}
                </AnimatePresence>
              </motion.div>

              <motion.div
                className={styles.footer}
                layout
                style={{
                  marginTop: issues.confirmPassword.success
                    ? "24px"
                    : calculateIssueMargin(
                        issues.confirmPassword.reasons,
                        true
                      ),
                }}
              >
                <KeybindButton
                  keybinds={[T_Keybind.e]}
                  // className={styles.formKeybind}
                  dangerous={false}
                  disabled={actionDisabled}
                  onPress={() => {
                    setFormVisible(false);

                    setTimeout(() => {
                      router.push("/app/me/login");
                    }, 250);
                  }}
                >
                  Login
                </KeybindButton>

                <KeybindButton
                  keybinds={[T_Keybind.enter]}
                  // className={styles.formKeybind}
                  dangerous={false}
                  disabled={actionDisabled}
                  onPress={_register}
                  loading={actionDisabled}
                  loadingText="Creating..."
                >
                  Continue
                </KeybindButton>
              </motion.div>

              {/* <div className={styles.continueButton}>Continue</div> */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
