"use client";

import { useState, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import Image from "next/image";

import clsx from "clsx";

import { AnimatePresence, motion } from "motion/react";

import { useBlurContext } from "@/components/blur-context";

import styles from "./menubar.module.css";

import createEvent from "@/actions/event/createEvent";
import joinEvent from "@/actions/event/joinEvent";

import type { T_User } from "@/gql/types";

import { Z_EventName, Z_EventDescription } from "@/modules/parser";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import { Magnetic } from "@/components/ui/mp_magnetic";
import { TextMorph } from "@/components/ui/mp_text-morph";

export default function MenuBar({ me }: { me: T_User }) {
  const router = useRouter();

  const { setIsBlurred } = useBlurContext();

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [joinEventOpen, setJoinEventOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewportDimensions, setViewportDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [heldKeys, setHeldKeys] = useState<Set<string>>(new Set());

  const [issues, setIssues] = useState<{
    eventName: {
      success: boolean;
      reasons: string[];
    };
    description: {
      success: boolean;
      reasons: string[];
    };
  }>({
    eventName: { success: true, reasons: [] },
    description: { success: true, reasons: [] },
  });

  const [createEventDisabled, setCreateEventDisabled] = useState(false);
  const [joinEventDisabled, setJoinEventDisabled] = useState(false);
  const [joinEventError, setJoinEventError] = useState<string | null>(null);

  const eventNameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const inputRefs = useRef<HTMLInputElement[]>([]);
  // const descriptionRef = useRef<HTMLInputElement>(null);

  // const [issues, setIssues] = useState<
  //   {
  //     field: string;
  //     reasons: string[];
  //   }[]
  // >([]);

  useEffect(() => {
    const handleResize = () => {
      setViewportDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (overlayOpen || joinEventOpen) {
      setIsBlurred(true);

      setShowForm(false);
      eventNameRef.current?.focus();
    } else {
      setIsBlurred(false);

      setIssues((prev) => ({
        ...prev,
        eventName: { success: true, reasons: [] },
        description: { success: true, reasons: [] },
      }));

      setTimeout(() => {
        setShowForm(true);
      }, 50);
    }
  }, [overlayOpen, joinEventOpen]);

  useEffect(() => {
    // Only focus on the first issue

    if (!issues.eventName.success) {
      eventNameRef.current?.focus();
      return;
    }

    if (!issues.description.success) {
      descriptionRef.current?.focus();
      return;
    }
  }, [issues]);

  const checkEventNameIssues = () => {
    const eventName = eventNameRef.current?.value;

    const eventNameResult = Z_EventName.safeParse(eventName);

    if (!eventNameResult.success) {
      let reasons = [];

      if (!eventName) {
        reasons = ["Event name is required"];
      } else {
        reasons = eventNameResult.error.issues.map((issue) => issue.message);
      }

      setIssues((prev) => ({
        ...prev,
        eventName: {
          success: false,
          reasons: reasons,
        },
      }));

      return {
        success: false,
        data: eventNameResult.data,
      };
    }

    setIssues((prev) => ({
      ...prev,
      eventName: {
        success: true,
        reasons: [],
      },
    }));

    return {
      success: true,
      data: eventNameResult.data,
    };
  };

  const checkDescriptionIssues = () => {
    const description = descriptionRef.current?.value;

    const descriptionResult = Z_EventDescription.safeParse(description);

    if (!descriptionResult.success) {
      let reasons = [];

      if (!description) {
        // Shouldn't be possible as Zod should
        // provide a default value
        reasons = ["Description is required"];
      } else {
        reasons = descriptionResult.error.issues.map((issue) => issue.message);
      }

      setIssues((prev) => ({
        ...prev,
        description: {
          success: false,
          reasons: reasons,
        },
      }));

      return {
        success: false,
        data: descriptionResult.data,
      };
    }

    setIssues((prev) => ({
      ...prev,
      description: {
        success: true,
        reasons: [],
      },
    }));

    return {
      success: true,
      data: descriptionResult.data,
    };
  };

  const checkFormIssues = () => {
    // const description = descriptionRef.current?.value;

    // const formIssues = [];

    const eventNameResult = checkEventNameIssues();
    const descriptionResult = checkDescriptionIssues();

    if (!eventNameResult.success || !descriptionResult.success) {
      return {
        success: false,
        eventName: eventNameResult.data,
        description: descriptionResult.data,
      };
    }

    return {
      success: true,
      eventName: eventNameResult.data,
      description: descriptionResult.data,
    };
  };

  const _joinEvent = async () => {
    if (joinEventDisabled) {
      return;
    }

    const textArray = [];

    for (let i = 0; i < 6; i++) {
      textArray.push(inputRefs.current[i].value);
    }

    const code = textArray.join("");

    if (code.length !== 6) {
      return;
    }

    if (!/^[0-9a-zA-Z]{6}$/.test(code)) {
      return;
    }

    setJoinEventDisabled(true);

    const result = await joinEvent("captchaDemo", code);

    setTimeout(() => {
      setJoinEventDisabled(false);

      if (result.success) {
        setJoinEventOpen(false);

        router.push("/app/me");
        // router.push(`/app/event/${result.data?.eventId}`);
      } else {
        setJoinEventError(result.message);

        setTimeout(() => {
          inputRefs.current[inputRefs.current.length - 1]?.focus();
        }, 100);
      }
    }, 1000);
  };

  return (
    <>
      <div className={styles.menuBar}>
        <div className={styles.menuBarContent}>
          <div className={styles.menuBarItem}>
            <div
              className={styles.joinEvent}
              onClick={() => setJoinEventOpen(true)}
            >
              Join Event
            </div>
            <div
              className={styles.createEvent}
              onClick={() => setOverlayOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={styles.createEventIcon}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 5l0 14" />
                <path d="M5 12l14 0" />
              </svg>
            </div>
            <div className={styles.profile}>
              <Image
                src={me.avatar}
                alt="avatar"
                width={42}
                height={42}
                className={styles.profileAvatar}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(overlayOpen || joinEventOpen) && (
          <motion.div
            className={styles.blurOverlay}
            initial={{
              clipPath: `circle(0px at ${viewportDimensions.width}px 0px)`,
              opacity: 0,
            }}
            animate={{
              clipPath: `circle(${Math.hypot(viewportDimensions.width, viewportDimensions.height)}px at ${viewportDimensions.width}px 0px)`,
              opacity: 1,
            }}
            exit={{
              clipPath: `circle(0px at ${viewportDimensions.width}px 0px)`,
              opacity: 0,
            }}
            onClick={() => {
              if (overlayOpen) {
                if (!createEventDisabled) {
                  setOverlayOpen(false);
                }
              } else {
                setJoinEventOpen(false);
              }
            }}
            transition={{
              type: "spring",
              stiffness: 90,
              damping: 10,
              mass: 1,
              opacity: { duration: 0.2 },
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {joinEventOpen && (
          <motion.div
            key="joinEventContent"
            className={styles.overlayContent}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              ...(showForm && {
                type: "spring",
                stiffness: 120,
                damping: 20,
              }),
              ...(!showForm && {
                duration: 0.2,
                ease: "easeInOut",
              }),
              delay: showForm ? 0.2 : 0,
            }}
          >
            <div
              className={styles.joinEventContainer}
              onClick={(e) => setJoinEventOpen(false)}
            >
              <AnimatePresence mode="wait">
                {joinEventDisabled && (
                  <motion.div
                    key="joinEventTitleJoining"
                    className={styles.joinEventTitle}
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.15,
                      ease: "easeInOut",
                    }}
                  >
                    Joining event...
                  </motion.div>
                )}

                {!joinEventError && !joinEventDisabled && (
                  <motion.div
                    key="joinEventTitle"
                    className={styles.joinEventTitle}
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.15,
                      ease: "easeInOut",
                    }}
                  >
                    Enter event code
                  </motion.div>
                )}

                {joinEventError && !joinEventDisabled && (
                  <motion.div
                    key="joinEventTitleError"
                    className={styles.joinEventTitle}
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.15,
                      ease: "easeInOut",
                    }}
                  >
                    {joinEventError}
                  </motion.div>
                )}
              </AnimatePresence>
              <div onClick={(e) => e.stopPropagation()}>
                <Magnetic
                  intensity={0.1}
                  springOptions={{ bounce: 0.1 }}
                  actionArea="global"
                  range={joinEventDisabled ? 0 : 0}
                  className={styles.joinEventInput}
                >
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Magnetic
                      key={index}
                      intensity={0.5}
                      springOptions={{ bounce: 0.5 }}
                      actionArea="global"
                      range={joinEventDisabled ? 0 : 25}
                      // className={styles.joinEventInput}
                    >
                      <input
                        autoFocus={index === 0}
                        type="text"
                        maxLength={1}
                        disabled={joinEventDisabled}
                        onKeyDown={async (e) => {
                          e.preventDefault();

                          setJoinEventError(null);

                          if (e.metaKey && e.code === "KeyV") {
                            // Handle paste (Cmd+V or Ctrl+V)
                            e.preventDefault();

                            const clipboardText =
                              await navigator.clipboard.readText();
                            const characters = clipboardText
                              .replace(/[^a-zA-Z0-9]/g, "")
                              .split("");

                            if (!characters.length) return;

                            let currentIndex = index;
                            for (
                              let i = 0;
                              i < characters.length && currentIndex < 6;
                              i++
                            ) {
                              inputRefs.current[currentIndex].value =
                                characters[i].toUpperCase();
                              currentIndex++;
                            }

                            const focusIndex = Math.min(currentIndex, 5);
                            inputRefs.current[focusIndex]?.focus();

                            // If we filled all 6 inputs, alert 'Submit'
                            if (currentIndex >= 6) {
                              _joinEvent();

                              return;
                            }

                            return;
                          }

                          if (e.key === "Tab") {
                            e.preventDefault();

                            if (index < 5) {
                              inputRefs.current[index + 1]?.focus();
                            } else {
                              inputRefs.current[0]?.focus();
                            }

                            return;
                          }

                          if (e.key === "Backspace") {
                            // if (index > 0) {
                            //   inputRefs.current[index - 1]?.focus();
                            // }

                            let target = index;

                            if (inputRefs.current[index].value === "") {
                              target -= 1;
                              inputRefs.current[index - 1]?.focus();
                            }

                            if (target < 0) {
                              return;
                            }

                            inputRefs.current[target].value = "";

                            return;
                          }

                          if (e.key === "ArrowRight") {
                            if (index < 5) {
                              inputRefs.current[index + 1]?.focus();
                            }

                            return;
                          }

                          if (e.key === "ArrowLeft") {
                            if (index > 0) {
                              inputRefs.current[index - 1]?.focus();
                            }

                            return;
                          }

                          if (!/^[0-9a-zA-Z]$/.test(e.key)) {
                            return;
                          }

                          inputRefs.current[index].value = e.key.toUpperCase();

                          const textArray = [];

                          for (let i = 0; i < 6; i++) {
                            textArray.push(inputRefs.current[i].value);
                          }

                          if (textArray.join("").length === 6) {
                            inputRefs.current[5]?.focus();
                            _joinEvent();
                            return;
                          }

                          if (index < 5) {
                            inputRefs.current[index + 1]?.focus();
                          }
                        }}
                        // onKeyUp={(e) => {
                        //   // if key match regex of 0-9 and a-z
                        //   if (!/^[0-9a-zA-Z]$/.test(e.key)) {
                        //     return;
                        //   }

                        //   inputRefs.current[index].value = e.key;

                        //   if (index < 5) {
                        //     inputRefs.current[index + 1]?.focus();
                        //   }
                        // }}
                        onSelect={(e) => {
                          if (inputRefs.current[index].value) {
                            inputRefs.current[index].setSelectionRange(1, 1);
                          }
                        }}
                        onClick={(e) => {
                          // e.preventDefault();

                          if (inputRefs.current[index].value) {
                            inputRefs.current[index].setSelectionRange(1, 1);
                          }
                        }}
                        onChange={(e) => {
                          console.log(e.target.value);

                          // if the input is not empty, focus the next input
                          if (e.target.value) {
                            inputRefs.current[index + 1]?.focus();
                          }
                        }}
                        className={clsx(
                          styles.joinEventInputSlot,
                          joinEventError && styles.joinEventInputSlotError
                        )}
                        ref={(el) => {
                          if (el) {
                            inputRefs.current[index] = el;
                          }
                        }}
                      />
                    </Magnetic>
                  ))}
                </Magnetic>
              </div>
            </div>
            <div className={styles.joinEventFormFooter}>
              <KeybindButton
                keybinds={[T_Keybind.escape]}
                onPress={() => {
                  setJoinEventOpen(false);
                }}
                disabled={createEventDisabled}
                // textClassName={styles.createEventFormButtonText}
              >
                Cancel
              </KeybindButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            className={styles.overlayContent}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              ...(showForm && {
                type: "spring",
                stiffness: 120,
                damping: 20,
              }),
              ...(!showForm && {
                duration: 0.2,
                ease: "easeInOut",
              }),
              delay: showForm ? 0.2 : 0,
            }}
          >
            <div className={styles.createEventForm}>
              <div className={styles.createEventFormHeader}>
                <input
                  className={clsx(
                    styles.createEventFormEventName,
                    !issues.eventName.success && styles.createEventFormInvalid
                  )}
                  onChange={() => {
                    checkEventNameIssues();
                  }}
                  onBlur={() => {
                    checkEventNameIssues();
                  }}
                  disabled={createEventDisabled}
                  maxLength={50}
                  type="text"
                  onKeyDown={(e) => {
                    const key = e.key.toLowerCase();
                    setHeldKeys((prev) => new Set(prev).add(key));

                    if (key === "enter") {
                      e.preventDefault();

                      if (heldKeys.has("shift")) {
                        setHeldKeys((prev) => {
                          const next = new Set(prev);
                          next.delete("shift");
                          return next;
                        });

                        eventNameRef.current?.blur();
                      }

                      if (!heldKeys.has("shift")) {
                        e.stopPropagation();
                        descriptionRef.current?.focus();
                      }
                    }
                  }}
                  onKeyUp={(e) => {
                    const key = e.key.toLowerCase();

                    setHeldKeys((prev) => {
                      const next = new Set(prev);
                      next.delete(key);
                      return next;
                    });
                  }}
                  placeholder="Event Name"
                  ref={eventNameRef}
                  required={true}
                />
                <AnimatePresence mode="popLayout">
                  {!issues.eventName.success &&
                    issues.eventName.reasons.map((reason, index) => (
                      <motion.div
                        key={`eventNameIssues_${index}`}
                        className={styles.createEventFormInvalidText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.2,
                          ease: "easeInOut",
                        }}
                      >
                        {reason}
                        {/* <TextMorph>{reason}</TextMorph> */}
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
              <div className={styles.createEventFormContent}>
                <textarea
                  className={clsx(
                    styles.createEventFormDescription,
                    !issues.description.success && styles.createEventFormInvalid
                  )}
                  disabled={createEventDisabled}
                  maxLength={500}
                  onChange={() => {
                    checkDescriptionIssues();
                  }}
                  onBlur={() => {
                    checkDescriptionIssues();
                  }}
                  style={{
                    height: "100%",
                  }}
                  // add on Shift + enter
                  onKeyDown={(e) => {
                    const key = e.key.toLowerCase();
                    setHeldKeys((prev) => new Set(prev).add(key));

                    if (key === "enter") {
                      if (heldKeys.has("shift")) {
                        console.log("shift + enter");
                        e.preventDefault();
                        descriptionRef.current?.blur();
                      }

                      if (!heldKeys.has("shift")) {
                        e.stopPropagation();
                      }
                    }
                  }}
                  onKeyUp={(e) => {
                    const key = e.key.toLowerCase();

                    setHeldKeys((prev) => {
                      const next = new Set(prev);
                      next.delete(key);
                      return next;
                    });
                  }}
                  placeholder="Description"
                  ref={descriptionRef}
                  required={false}
                />
                <AnimatePresence mode="popLayout">
                  {!issues.description.success && (
                    <motion.div
                      key="descriptionIssues"
                      className={styles.createEventFormInvalidText}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.2,
                        ease: "easeInOut",
                      }}
                    >
                      <TextMorph>
                        {issues.description.reasons.join(", ")}
                      </TextMorph>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className={styles.createEventFormFooter}>
                <KeybindButton
                  keybinds={[T_Keybind.escape]}
                  onPress={() => {
                    setOverlayOpen(false);
                  }}
                  disabled={createEventDisabled}
                  // textClassName={styles.createEventFormButtonText}
                >
                  Cancel
                </KeybindButton>

                <KeybindButton
                  keybinds={[T_Keybind.shift, T_Keybind.enter]}
                  onPress={async () => {
                    const {
                      success: checkSuccess,
                      eventName,
                      description,
                    } = checkFormIssues();

                    if (!checkSuccess) {
                      return;
                    }

                    setCreateEventDisabled(true);

                    const result = await createEvent(
                      "captchaDemo",
                      eventName!,
                      description!
                    );

                    setTimeout(() => {
                      setCreateEventDisabled(false);

                      if (result.success) {
                        setOverlayOpen(false);
                        router.push(`/app/me/drafts`);
                      }
                    }, 1000);
                  }}
                  disabled={createEventDisabled}
                  loading={createEventDisabled}
                  loadingText="Creating..."
                  // textClassName={styles.createEventFormButtonText}
                >
                  Create Event
                </KeybindButton>

                {/* <Magnetic
                  intensity={0.1}
                  springOptions={{ bounce: 0.1 }}
                  actionArea="global"
                  className={clsx(
                    styles.createEventFormMagnet,
                    styles.createEventFormMagnetCancel,
                    createEventDisabled && styles.createEventFormMagnetDisabled
                  )}
                  range={createEventDisabled ? 0 : 200}
                >
                  <button
                    className={clsx(
                      styles.createEventFormButton,
                      styles.createEventFormButtonCancel
                    )}
                    onClick={() => {
                      // Just to be safe, disabled can be modified by inspect element
                      if (!createEventDisabled) {
                        setOverlayOpen(false);
                      }
                    }}
                    disabled={createEventDisabled}
                  >
                    <Magnetic
                      intensity={0.1}
                      springOptions={{ bounce: 0.1 }}
                      actionArea="global"
                      className={styles.createEventFormButtonText}
                      range={createEventDisabled ? 0 : 100}
                    >
                      Cancel
                    </Magnetic>
                    <Keybind
                      keybinds={[T_Keybind.escape]}
                      className={styles.createEventFormKeybind}
                      parentClass={styles.createEventFormKeybindCancel}
                      dangerous={true}
                      disabled={createEventDisabled}
                      onPress={() => {
                        setOverlayOpen(false);
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
                    styles.createEventFormMagnet,
                    createEventDisabled && styles.createEventFormMagnetDisabled
                    // styles.createEventFormMagnetCreate,
                  )}
                  range={createEventDisabled ? 0 : 200}
                >
                  <button
                    className={styles.createEventFormButton}
                    onClick={_createEvent}
                    disabled={createEventDisabled}
                  >
                    <Spinner loading={createEventDisabled} size={24} />
                    <Magnetic
                      intensity={0.1}
                      springOptions={{ bounce: 0.1 }}
                      actionArea="global"
                      className={styles.createEventFormButtonText}
                      range={createEventDisabled ? 0 : 100}
                    >
                      <TextMorph>
                        {createEventDisabled ? "Creating..." : "Create Event"}
                      </TextMorph>
                    </Magnetic>
                    <Keybind
                      keybinds={[T_Keybind.shift, T_Keybind.enter]}
                      className={styles.createEventFormKeybind}
                      onPress={() => {
                        // alert("Create event");
                        _createEvent();
                        // setOverlayOpen(false);
                      }}
                      disabled={createEventDisabled}
                      dangerous={false}
                    />
                  </button>
                </Magnetic> */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* <AnimatePresence>
        {createFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 20,
              // opacity: {
              //   duration: 0.2,
              // },
            }}
            className={styles.createForm}
            onClick={() => setCreateFormOpen(false)}
          >
            <div className={styles.createFormContent}>
              <div className={styles.createFormHeader}>
                <h1>Create Event</h1>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </>
  );
}
