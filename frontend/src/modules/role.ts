import type { T_User } from "@/gql/types";

// SHARED WITH BACKEND!

const platformRoleHierarchy = {
  SUPER_ADMIN: 2,
  ADMIN: 1,
  USER: 0,
};

export default class lib_role {
  public static isSuperAdmin(user: T_User) {
    return user.platformRole === "SUPER_ADMIN";
  }

  public static isAdmin(user: T_User) {
    return user.platformRole === "ADMIN";
  }

  public static isUser(user: T_User) {
    return user.platformRole === "USER";
  }

  public static hasRole(
    user: T_User,
    role: keyof typeof platformRoleHierarchy
  ) {
    const userPlatformRole =
      user.platformRole as keyof typeof platformRoleHierarchy;
    const requiredPlatformRole = role as keyof typeof platformRoleHierarchy;

    return (
      platformRoleHierarchy[userPlatformRole] >=
      platformRoleHierarchy[requiredPlatformRole]
    );
  }
}
