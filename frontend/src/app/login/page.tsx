import login from "@/actions/user/login";

export default function Page() {
  return (
    <div>
      <h1>Login</h1>
      <form action={login}>
        <div>
          <label htmlFor="email">Email</label>
          <input type="text" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
