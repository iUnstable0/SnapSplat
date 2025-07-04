// SHARED WITH FRONTEND!

import { T_EventMembership, T_User } from "@/gql/types";

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
  public static platform_isSuperAdmin(user: T_User) {
    return user.platformRole === "SUPER_ADMIN";
  }

  public static platform_isAdmin(user: T_User) {
    return user.platformRole === "ADMIN";
  }

  public static platform_isUser(user: T_User) {
    return user.platformRole === "USER";
  }

  public static platform_hasRole(user: T_User, role: string) {
    const userPlatformRole =
      user.platformRole as keyof typeof platformRoleHierarchy;
    const requiredPlatformRole = role as keyof typeof platformRoleHierarchy;

    return (
      platformRoleHierarchy[userPlatformRole] >=
      platformRoleHierarchy[requiredPlatformRole]
    );
  }

  public static event_isHost(membership: T_EventMembership) {
    return membership.eventRole === "HOST";
  }

  public static event_isCohost(membership: T_EventMembership) {
    return membership.eventRole === "COHOST";
  }

  public static event_isAttendee(membership: T_EventMembership) {
    return membership.eventRole === "ATTENDEE";
  }

  public static event_hasRole(membership: T_EventMembership, role: string) {
    const eventRole = membership.eventRole as keyof typeof eventRoleHierarchy;
    const requiredEventRole = role as keyof typeof eventRoleHierarchy;

    return (
      eventRoleHierarchy[eventRole] >= eventRoleHierarchy[requiredEventRole]
    );
  }
}
