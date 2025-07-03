"use client";

import { useState, useEffect, useRef, useActionState } from "react";

import Image from "next/image";

import clsx from "clsx";

import * as gql_builder from "gql-query-builder";

import { AnimatePresence, motion } from "motion/react";

import Keybind, { T_Keybind } from "@/components/keybind";

import styles from "./menubar.module.css";

import type { T_User } from "@/gql/types";

import { Z_EventName, Z_EventDescription } from "@/modules/parser";

import _createEvent from "@/actions/event/createEvent";

import { Magnetic } from "@/components/ui/mp_magnetic";
import { TextMorph } from "@/components/ui/mp_text-morph";
import Spinner from "@/components/spinner";

const initialCreateEventState = {
  message: "",
};

export default function MenuBar({ user }: { user: T_User }) {
  const [createEventState, createEventAction] = useActionState(
    _createEvent,
    initialCreateEventState
  );

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewportDimensions, setViewportDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [heldKeys, setHeldKeys] = useState<Set<string>>(new Set());

  const eventNameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [issues, setIssues] = useState<
    {
      field: string;
      reasons: string[];
    }[]
  >([]);

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
      setShowForm(false);
      eventNameRef.current?.focus();
    } else {
      setTimeout(() => {
        setShowForm(true);
      }, 50);
    }
  }, [overlayOpen]);

  const checkFormIssues = () => {
    const eventName = eventNameRef.current?.value;
    const description = descriptionRef.current?.value;

    const formIssues = [];

    const eventNameResult = Z_EventName.safeParse(eventName);
    const descriptionResult = Z_EventDescription.safeParse(description);

    if (!eventNameResult.success) {
      if (!eventName) {
        formIssues.push({
          field: "eventName",
          reasons: ["Event name is required"],
        });
      } else {
        formIssues.push({
          field: "eventName",
          reasons: eventNameResult.error.issues.map((issue) => issue.message),
        });
      }
    }

    if (!descriptionResult.success) {
      formIssues.push({
        field: "description",
        reasons: descriptionResult.error.issues.map((issue) => issue.message),
      });
    }

    if (formIssues.length > 0) {
      setIssues(formIssues);

      setCreateEventDisabled(false);

      if (formIssues.some((issue) => issue.field === "eventName")) {
        eventNameRef.current?.focus();
      }

      if (formIssues.some((issue) => issue.field === "description")) {
        descriptionRef.current?.focus();
      }

      return {
        eventName: eventNameResult.data,
        description: descriptionResult.data,
      };
    }

    setIssues([]);

    return {
      eventName: eventNameResult.data,
      description: descriptionResult.data,
    };
  };

  const createEvent = () => {
    // Just for extra safety
    if (createEventDisabled) {
      return;
    }

    setCreateEventDisabled(true);

    const { eventName, description } = checkFormIssues();

    if (issues.length > 0) {
      // alert("theres an issue");
      return;
    }

    _createEvent("d", eventName!, description!);

    _createEvent.bind(null, "d", eventName, description);

    // alert(eventName);
    // alert(description);

    let createdEvent;

    try {
      // createdEvent = await requester.request({
      //   data: gql_builder.mutation({
      //     operation: "createEvent",
      //     fields: ["captchaToken", "name", "description"],
      //     variables: {
      //       captchaToken: {
      //         value: "123",
      //         required: true,
      //       },
      //       name: {
      //         value: ,
      //         required: true,
      //       },
      //       description: {
      //         value: descriptionRef.current?.value,
      //         required: false,
      //       },
      //     },
      //   }),
      // });
    } catch (error) {
      console.error("Error creating event", error);
    }

    // alert(eventName);
    // alert(description);
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
                src={user.avatar}
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
                    issues.some((issue) => issue.field === "eventName") &&
                      styles.createEventFormInvalid
                  )}
                  onChange={() => {
                    checkFormIssues();
                  }}
                  onBlur={() => {
                    checkFormIssues();
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
                  {issues.map(
                    (issue, index) =>
                      issue.field === "eventName" && (
                        <motion.div
                          key={index}
                          className={styles.createEventFormInvalidText}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 0.2,
                            ease: "easeInOut",
                          }}
                        >
                          <TextMorph>{issue.reasons.join(", ")}</TextMorph>
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
              <div className={styles.createEventFormContent}>
                <textarea
                  className={clsx(
                    styles.createEventFormDescription,
                    issues.some((issue) => issue.field === "description") &&
                      styles.createEventFormInvalid
                  )}
                  disabled={createEventDisabled}
                  maxLength={500}
                  onChange={() => {
                    checkFormIssues();
                  }}
                  onBlur={() => {
                    checkFormIssues();
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
                  {issues.map(
                    (issue, index) =>
                      issue.field === "description" && (
                        <motion.div
                          key={index}
                          className={styles.createEventFormInvalidText}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 0.2,
                            ease: "easeInOut",
                          }}
                        >
                          <TextMorph>{issue.reasons.join(", ")}</TextMorph>
                        </motion.div>
                      )
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
                    onClick={() => {
                      createEvent();
                    }}
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
                        createEvent();
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
