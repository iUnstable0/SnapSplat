"use client";

import { useState, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import Image from "next/image";

import clsx from "clsx";

import { AnimatePresence, motion } from "motion/react";

import { useBlurContext } from "./blur-context";

import styles from "./menubar.module.css";

import createEvent from "@/actions/event/createEvent";

import type { T_User } from "@/gql/types";

import { Z_EventName, Z_EventDescription } from "@/modules/parser";

import Keybind, { T_Keybind } from "@/components/keybind";

import { Magnetic } from "@/components/ui/mp_magnetic";
import { TextMorph } from "@/components/ui/mp_text-morph";
import Spinner from "@/components/spinner";

export default function MenuBar({ me }: { me: T_User }) {
  const router = useRouter();

  const { isBlurred, setIsBlurred } = useBlurContext();

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewportDimensions, setViewportDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [heldKeys, setHeldKeys] = useState<Set<string>>(new Set());

  const eventNameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  // const descriptionRef = useRef<HTMLInputElement>(null);

  // const [issues, setIssues] = useState<
  //   {
  //     field: string;
  //     reasons: string[];
  //   }[]
  // >([]);

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
    if (overlayOpen) {
      setIsBlurred(true);

      setShowForm(false);
      eventNameRef.current?.focus();
    } else {
      setIsBlurred(false);

      setIssues({
        eventName: { success: true, reasons: [] },
        description: { success: true, reasons: [] },
      });

      setTimeout(() => {
        setShowForm(true);
      }, 50);
    }
  }, [overlayOpen]);

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

      setIssues({
        ...issues,
        eventName: {
          success: false,
          reasons: reasons,
        },
      });

      return {
        success: false,
        data: eventNameResult.data,
      };
    }

    setIssues({
      ...issues,
      eventName: {
        success: true,
        reasons: [],
      },
    });

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

      setIssues({
        ...issues,
        description: {
          success: false,
          reasons: reasons,
        },
      });

      return {
        success: false,
        data: descriptionResult.data,
      };
    }

    setIssues({
      ...issues,
      description: {
        success: true,
        reasons: [],
      },
    });

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

  const _createEvent = async () => {
    // Just for extra safety
    if (createEventDisabled) {
      return;
    }

    // setCreateEventDisabled(true);

    const { success: checkSuccess, eventName, description } = checkFormIssues();

    if (!checkSuccess) {
      // setCreateEventDisabled(false);
      // alert("theres an issue");
      return;
    }

    setCreateEventDisabled(true);

    const result = await createEvent("d", eventName!, description!);

    // if (!result.success) {
    //   setTimeout(() => {
    //     setCreateEventDisabled(false);
    //   }, 1000);

    //   // alert(result.message);

    //   return;
    // }

    // router.push(`/app/event/${result.data.eventId}`);
    // router.push(`/app/me/drafts`);

    setTimeout(() => {
      setCreateEventDisabled(false);

      if (result.success) {
        setOverlayOpen(false);
        // router.push(`/app/event/${result.data.eventId}`);
        router.push(`/app/me/drafts`);
      }
    }, 1000);

    // alert(result.message);

    // return;
  };

  return (
    <>
      <div className={styles.menuBar}>
        <div className={styles.menuBarContent}>
          <div className={styles.menuBarItem}>
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
        {overlayOpen && (
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
              if (!createEventDisabled) {
                setOverlayOpen(false);
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
                  {!issues.eventName.success && (
                    <motion.div
                      key="eventNameIssues"
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
                        {issues.eventName.reasons.join(", ")}
                      </TextMorph>
                    </motion.div>
                  )}
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
                <Magnetic
                  intensity={0.1}
                  springOptions={{ bounce: 0.1 }}
                  actionArea="global"
                  className={clsx(
                    styles.createEventFormMagnet,
                    styles.createEventFormMagnetCancel
                  )}
                  range={200}
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
                    <Magnetic
                      intensity={0.1}
                      springOptions={{ bounce: 0.1 }}
                      actionArea="global"
                      className={styles.createEventFormButtonText}
                      range={100}
                    >
                      Cancel
                    </Magnetic>
                  </button>
                </Magnetic>
                <Magnetic
                  intensity={0.1}
                  springOptions={{ bounce: 0.1 }}
                  actionArea="global"
                  className={clsx(
                    styles.createEventFormMagnet
                    // styles.createEventFormMagnetCreate,
                  )}
                  range={200}
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
                      range={100}
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
                </Magnetic>
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
