import gql from "@/gql";

export default async function Page() {
  // const gql = createGQL();

  let user = null;

  try {
    // Attempt to fetch user data
    user = (await gql.query.user()).data.data.user;
  } catch (error) {
    // Handle error if user data fetch fails
    console.error("Error fetching user data:", error);

    // Optionally, you can return an error message or redirect
    return <h1>Error fetching user data</h1>;
  }

  console.log("User data fetched successfully:", user);

  return <h1>Hello world! {user.email}</h1>;
}
