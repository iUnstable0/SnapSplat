// SHARED WITH FRONTEND!

const platformRoleHierarchy = {
  SUPER_ADMIN: 2,
  ADMIN: 1,
  USER: 0,
};

export default class lib_role {
  public static async isSuperAdmin(user: any) {
    return user.platformRole === "SUPER_ADMIN";
  }

  public static async isAdmin(user: any) {
    return user.platformRole === "ADMIN";
  }

  public static async isUser(user: any) {
    return user.platformRole === "USER";
  }

  public static async hasRole(user: any, role: string) {
    const userPlatformRole =
      user.platformRole as keyof typeof platformRoleHierarchy;
    const requiredPlatformRole = role as keyof typeof platformRoleHierarchy;

    return (
      platformRoleHierarchy[userPlatformRole] >=
      platformRoleHierarchy[requiredPlatformRole]
    );
  }
}
