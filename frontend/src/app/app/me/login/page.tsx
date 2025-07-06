"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Image from "next/image";

import clsx from "clsx";

import { AnimatePresence, motion } from "motion/react";

import login from "@/actions/user/login";

import styles from "./page.module.css";

import { TextMorph } from "@/components/ui/mp_text-morph";
import { Magnetic } from "@/components/ui/mp_magnetic";
import Keybind, { T_Keybind } from "@/components/keybind";
import Spinner from "@/components/spinner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [actionDisabled, setActionDisabled] = useState(false);

  const [blurOverlayOpen, setBlurOverlayOpen] = useState(true);
  const [formVisible, setFormVisible] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  const [issues, setIssues] = useState<{
    email: {
      success: boolean;
      reasons: string[];
    };
    password: {
      success: boolean;
      reasons: string[];
    };
  }>({
    email: { success: true, reasons: [] },
    password: { success: true, reasons: [] },
  });

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only focus on the first issue

    if (!issues.email.success) {
      emailRef.current?.focus();
      return;
    }

    if (!issues.password.success) {
      passwordRef.current?.focus();
      return;
    }
  }, [issues]);

  const checkEmailIssues = async () => {
    const email = emailRef.current?.value;

    if (!email) {
      setIssues({
        ...issues,
        email: {
          success: false,
          reasons: ["Email is required"],
        },
      });

      return { success: false, data: email };
    }

    setIssues({
      ...issues,
      email: {
        success: true,
        reasons: [],
      },
    });

    return { success: true, data: email };
  };

  const checkPasswordIssues = async () => {
    const password = passwordRef.current?.value;

    if (!password) {
      setIssues({
        ...issues,
        password: {
          success: false,
          reasons: ["Password is required"],
        },
      });

      return { success: false, data: password };
    }

    setIssues({
      ...issues,
      password: {
        success: true,
        reasons: [],
      },
    });

    return { success: true, data: password };
  };

  const checkFormIssues = async () => {
    const emailResult = await checkEmailIssues();
    const passwordResult = await checkPasswordIssues();

    if (!emailResult.success || !passwordResult.success) {
      return {
        success: false,
        email: emailResult.data,
        password: passwordResult.data,
      };
    }

    return {
      success: true,
      email: emailResult.data,
      password: passwordResult.data,
    };
  };

  const _login = async () => {
    if (actionDisabled) return;

    const { success: checkSuccess, email, password } = await checkFormIssues();

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

    const result = await login("captchaDemo", email!, password!);

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
        setIssues({
          ...issues,
          password: {
            success: false,
            reasons: [result.message],
          },
        });
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
                  Login to your SnapSplat account to continue
                </div>
              </motion.div>

              <motion.div className={styles.inputContainer} layout>
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
                  onChange={checkPasswordIssues}
                  onBlur={checkPasswordIssues}
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
                className={styles.footer}
                layout
                style={{
                  marginTop: issues.password.success
                    ? "24px"
                    : calculateIssueMargin(issues.password.reasons, true),
                }}
              >
                <Magnetic
                  intensity={0.1}
                  springOptions={{ bounce: 0.1 }}
                  actionArea="global"
                  className={clsx(
                    styles.formMagnet,
                    actionDisabled && styles.formMagnetDisabled
                  )}
                  range={actionDisabled ? 0 : 200}
                >
                  <button
                    className={styles.formButton}
                    onClick={() => {
                      if (!actionDisabled) {
                        setFormVisible(false);

                        setTimeout(() => {
                          router.push("/app/me/register");
                        }, 250);
                      }
                    }}
                    disabled={actionDisabled}
                  >
                    <Magnetic
                      intensity={0.1}
                      springOptions={{ bounce: 0.1 }}
                      actionArea="global"
                      className={styles.formButtonText}
                      range={actionDisabled ? 0 : 100}
                    >
                      Register
                    </Magnetic>
                    <Keybind
                      keybinds={[T_Keybind.e]}
                      className={styles.formKeybind}
                      dangerous={false}
                      disabled={actionDisabled}
                      onPress={() => {
                        setFormVisible(false);

                        setTimeout(() => {
                          router.push("/app/me/register");
                        }, 250);
                      }}
                      // parentClass={styles.createEventFormKeybindCancel}
                    />
                  </button>
                </Magnetic>
                <Magnetic
                  intensity={0.1}
                  springOptions={{ bounce: 0.1 }}
                  actionArea="global"
                  className={clsx(
                    styles.formMagnet,
                    actionDisabled && styles.formMagnetDisabled
                  )}
                  range={actionDisabled ? 0 : 200}
                >
                  <button
                    className={styles.formButton}
                    onClick={_login}
                    disabled={actionDisabled}
                  >
                    <Spinner loading={actionDisabled} size={24} />
                    <Magnetic
                      intensity={0.1}
                      springOptions={{ bounce: 0.1 }}
                      actionArea="global"
                      className={styles.formButtonText}
                      range={actionDisabled ? 0 : 100}
                    >
                      Continue
                    </Magnetic>
                    <Keybind
                      keybinds={[T_Keybind.enter]}
                      className={styles.formKeybind}
                      dangerous={false}
                      disabled={actionDisabled}
                      onPress={_login}
                      // parentClass={styles.createEventFormKeybindCancel}
                    />
                  </button>
                </Magnetic>
              </motion.div>

              {/* <div className={styles.continueButton}>Continue</div> */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
