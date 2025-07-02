export default {
  operation: "user",
  fields: [
    {
      events: [
        "eventId",
        "name",
        "description",
        "startsAt",
        "endsAt",
        "isArchived",
        "createdAt",
        {
          memberships: ["eventRole", "displayNameAlt", "avatarAlt", "joinedAt"],
        },
        {
          host: {
            fields: ["displayNameAlt", "avatarAlt"],
          },
        },
      ],
    },
    {
      ownedEvents: [
        "eventId",
        "name",
        "description",
        "startsAt",
        "endsAt",
        "isArchived",
        "createdAt",
        {
          memberships: ["eventRole", "displayNameAlt", "avatarAlt", "joinedAt"],
        },
      ],
    },
  ],
};
