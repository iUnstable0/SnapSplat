import gql from "@/gql";

export default async function Page() {
  // const gql = createGQL();

  let user = null;

  try {
    user = (await gql.query.user()).user;
  } catch (error) {
    console.log(error.data[0].extensions.originalError);
    console.error("Error fetching user data:", error);

    return <h1>Error fetching user data</h1>;
  }

  console.log("User data fetched successfully:", user);

  return <h1>Hello world! {user.email}</h1>;
}
