// SHARED WITH FRONTEND!

import type { PlatformRole, EventRole } from "@/generated/prisma";

const platformRoleHierarchy = {
  SUPER_ADMIN: 2,
  ADMIN: 1,
  USER: 0,
};

const eventRoleHierarchy = {
  HOST: 2,
  COHOST: 1,
  ATTENDEE: 0,
};

export default class lib_role {
  public static async platform_isSuperAdmin(user: any) {
    return user.platformRole === "SUPER_ADMIN";
  }

  public static async platform_isAdmin(user: any) {
    return user.platformRole === "ADMIN";
  }

  public static async platform_isUser(user: any) {
    return user.platformRole === "USER";
  }

  public static async platform_hasRole(user: any, role: PlatformRole) {
    const userPlatformRole =
      user.platformRole as keyof typeof platformRoleHierarchy;
    const requiredPlatformRole = role as keyof typeof platformRoleHierarchy;

    return (
      platformRoleHierarchy[userPlatformRole] >=
      platformRoleHierarchy[requiredPlatformRole]
    );
  }

  public static async event_isHost(event: any) {
    return event.eventRole === "HOST";
  }

  public static async event_isCohost(event: any) {
    return event.eventRole === "COHOST";
  }

  public static async event_isAttendee(event: any) {
    return event.eventRole === "ATTENDEE";
  }

  public static async event_hasRole(event: any, role: EventRole) {
    const eventRole = event.eventRole as keyof typeof eventRoleHierarchy;
    const requiredEventRole = role as keyof typeof eventRoleHierarchy;

    return (
      eventRoleHierarchy[eventRole] >= eventRoleHierarchy[requiredEventRole]
    );
  }
}
