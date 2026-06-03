/// <reference path="../pb_data/types.d.ts" />

const NAMI_BASE = "https://nami.dpsg.de/ica/rest";

function namiSession() {
  const rows = $app.findRecordsByFilter("settings", `integration = "nami"`, "", 1, 0);
  if (!rows.length) throw new Error("NaMi Einstellungen nicht gefunden");
  const s = rows[0];
  const username = s.getString("namiUsername");
  const password = s.getString("namiPassword");
  const groupId  = s.getString("namiGroupId");
  if (!username || !password || !groupId) throw new Error("NaMi Einstellungen unvollständig");

  const loginRes = $http.send({
    url: `${NAMI_BASE}/nami/auth/manual/sessionStartup`,
    method: "POST",
    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&Login=API&redirectTo=`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (loginRes.statusCode !== 200) throw new Error(`Login fehlgeschlagen (HTTP ${loginRes.statusCode})`);
  const loginData = loginRes.json;
  if (!loginData || loginData.statusCode !== 0) {
    throw new Error("Login fehlgeschlagen: " + (loginData && loginData.statusMessage ? loginData.statusMessage : "Ungültige Anmeldedaten"));
  }

  const rawCookie = loginRes.headers["Set-Cookie"] || loginRes.headers["set-cookie"] || "";
  const cookieStr = (Array.isArray(rawCookie) ? rawCookie : String(rawCookie).split("\n"))
    .map(function(c) { return c.split(";")[0].trim(); })
    .filter(Boolean)
    .join("; ");

  if (!cookieStr) throw new Error("Session-Cookie nicht empfangen");
  return { cookieStr: cookieStr, groupId: groupId };
}

function namiLogout(cookieStr) {
  try {
    $http.send({ url: `${NAMI_BASE}/nami/auth/logout`, method: "GET", headers: { "Cookie": cookieStr } });
  } catch (_) {}
}

module.exports = { namiSession, namiLogout, NAMI_BASE };
