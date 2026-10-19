export const ADMIN_COOKIE_NAME = "adminToken";

export const getAdminCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/admin",
});