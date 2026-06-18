export async function getYoutubeToken() {
  const tokenResponse = await chrome.identity.getAuthToken({
    interactive: true,
  } as any);

  return typeof tokenResponse === "string"
    ? tokenResponse
    : tokenResponse?.token;
}

export async function logoutYoutube() {
  const token = await getYoutubeToken();

  if (token) {
    await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);

    await chrome.identity.removeCachedAuthToken({
      token,
    });
  }

  await chrome.storage.local.remove(["youtubeChannel"]);

  return { success: true };
}
