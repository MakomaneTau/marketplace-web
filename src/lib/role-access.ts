type Profile = { role?: string; isAdmin?: boolean } | null | undefined;

const within = (path: string, root: string) =>
  path === root || path.startsWith(`${root}/`);

export function roleHome(profile: Profile) {
  return profile?.isAdmin
    ? "/admin"
    : profile?.role === "seller"
      ? "/seller"
      : "/";
}

export function isBuyer(profile: Profile) {
  return profile?.role === "buyer" && profile.isAdmin !== true;
}

export function isBuyerPage(path: string) {
  return (
    path === "/" ||
    [
      "/search",
      "/categories",
      "/cart",
      "/favourites",
      "/orders",
      "/messages",
      "/shops",
    ].some((root) => within(path, root)) ||
    (within(path, "/products") &&
      path !== "/products/new" &&
      !path.endsWith("/edit"))
  );
}

export function isPublicBuyerPage(path: string) {
  return (
    isBuyerPage(path) &&
    !["/cart", "/favourites", "/orders", "/messages"].some((root) =>
      within(path, root),
    )
  );
}

export function roleRedirect(profile: Profile, path: string) {
  if (!profile) return null;
  if (isBuyerPage(path) && !isBuyer(profile))
    return roleHome(profile) === "/" ? "/access-denied" : roleHome(profile);
  return null;
}

export function loginDestination(profile: Profile, requested: string | null) {
  if (
    !requested?.startsWith("/") ||
    requested.startsWith("//") ||
    /[\\\x00-\x1f\x7f]/.test(requested)
  )
    return roleHome(profile);
  const path = new URL(requested, "https://marketplace.invalid").pathname;
  if (
    roleRedirect(profile, path) ||
    within(path, "/login") ||
    within(path, "/signup") ||
    (within(path, "/admin") && !profile?.isAdmin) ||
    ((within(path, "/seller") ||
      path === "/products/new" ||
      path.endsWith("/edit")) &&
      (profile?.role !== "seller" || profile.isAdmin))
  )
    return roleHome(profile);
  return requested;
}
