// SHARED WITH FRONTEND!

import { T_Event, T_User } from "@/gql/types";

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
  public static async platform_isSuperAdmin(user: T_User) {
    return user.platformRole === "SUPER_ADMIN";
  }

  public static async platform_isAdmin(user: T_User) {
    return user.platformRole === "ADMIN";
  }

  public static async platform_isUser(user: T_User) {
    return user.platformRole === "USER";
  }

  public static async platform_hasRole(user: T_User, role: string) {
    const userPlatformRole =
      user.platformRole as keyof typeof platformRoleHierarchy;
    const requiredPlatformRole = role as keyof typeof platformRoleHierarchy;

    return (
      platformRoleHierarchy[userPlatformRole] >=
      platformRoleHierarchy[requiredPlatformRole]
    );
  }

  public static async event_isHost(event: T_Event) {
    return event.eventRole === "HOST";
  }

  public static async event_isCohost(event: T_Event) {
    return event.eventRole === "COHOST";
  }

  public static async event_isAttendee(event: T_Event) {
    return event.eventRole === "ATTENDEE";
  }

  public static async event_hasRole(event: T_Event, role: string) {
    const eventRole = event.eventRole as keyof typeof eventRoleHierarchy;
    const requiredEventRole = role as keyof typeof eventRoleHierarchy;

    return (
      eventRoleHierarchy[eventRole] >= eventRoleHierarchy[requiredEventRole]
    );
  }
}
