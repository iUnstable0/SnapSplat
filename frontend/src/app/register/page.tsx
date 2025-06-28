import register from "@/actions/user/register";

export default function Page() {
  return (
    <div>
      <h1>Register</h1>
      <form action={register}>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" required />
        </div>
        <div>
          <label htmlFor="">Display Name</label>
          <input type="name" id="displayName" name="displayName" required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
