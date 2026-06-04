/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  e.next()

  const message = new MailerMessage({
    from: {
      address: e.app.settings().meta.senderAddress,
      name: e.app.settings().meta.senderName,
    },
    to: [ { address: e.record.email() } ],
    subject: "Deine 3Bein Einladung",
    html: `
      <!doctype html>
      <html lang="de">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Deine 3Bein Einladung</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <span style="font-size:32px;">⛺</span>
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#18181b;">3Bein</h1>
                    </td>
                  </tr>

                  <!-- Card -->
                  <tr>
                    <td style="background:#ffffff;border-radius:12px;padding:40px 36px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

                      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#18181b;">Gut Pfad! 👋</h2>
                      <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
                        Du wurdest eingeladen, dich bei <strong>3Bein</strong> anzumelden –
                        der Verwaltungsplattform für unsere Pfadfindergruppe.
                        Klicke auf den Button und lege dein Konto an.
                      </p>

                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding:8px 0 32px;">
                            <a href="${e.app.settings().meta.appURL}/invite/${e.record.id}"
                               style="display:inline-block;background-color:#16a34a;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:8px;">
                              Konto erstellen
                            </a>
                          </td>
                        </tr>
                      </table>

                      <hr style="border:none;border-top:1px solid #e4e4e7;margin:0 0 24px;" />

                      <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">
                        Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br />
                        <a href="${e.app.settings().meta.appURL}/invite/${e.record.id}"
                           style="color:#16a34a;word-break:break-all;">
                          ${e.app.settings().meta.appURL}/invite/${e.record.id}
                        </a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding-top:24px;">
                      <p style="margin:0;font-size:12px;color:#a1a1aa;">
                        Du hast diese E-Mail erhalten, weil du zu 3Bein eingeladen wurdest.<br />
                        Falls das ein Fehler war, kannst du diese E-Mail ignorieren.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    // bcc, cc and custom headers are also supported...
  })

  e.app.newMailClient().send(message)
}, "invites")

onRecordCreateRequest((e) => {
  const email = e.record.getString("email");

  let invite = null;
  try {
    invite = $app.findFirstRecordByFilter(
      "invites",
      `email = "${email}" && expires > @now`
    );
  } catch (_) {}

  if (!invite) {
    throw new BadRequestError("Eine gültige Einladung ist erforderlich.");
  }

  e.next();
}, "users");

routerAdd("GET", "/api/admin/logs", (e) => {
  const info = e.requestInfo();

  if (!info.auth || info.auth.collection().name !== "users") {
    return e.json(401, { message: "Unauthorized" });
  }

  try {
    const user = $app.findRecordById("users", info.auth.id);
    if (!user.getBool("admin")) {
      return e.json(403, { message: "Forbidden" });
    }
  } catch (_) {
    return e.json(403, { message: "Forbidden" });
  }

  let logs = arrayOf(new DynamicModel({
    id: "",
    created: "",
    message: "",
    level: 0,
    data: {},
  }))

  $app.logQuery().orderBy("created DESC").limit(100).all(logs);
  return e.json(200, { items: logs });
});

routerAdd("GET", "/api/nami/members", (e) => {
  if (!e.requestInfo().auth || e.requestInfo().auth.collection().name !== "users") {
    return e.json(401, { message: "Unauthorized" });
  }
  const { namiSession, namiLogout, NAMI_BASE } = require(`${__hooks}/nami.js`);

  var session;
  try { session = namiSession(); } catch (err) { return e.json(502, { message: String(err) }); }

  var res;
  try {
    res = $http.send({
      url: NAMI_BASE + "/nami/mitglied/filtered-for-navigation/gruppierung/gruppierung/" + session.groupId + "/flist?page=1&start=0&limit=5000",
      method: "GET",
      headers: { "Cookie": session.cookieStr },
    });
  } catch (err) {
    namiLogout(session.cookieStr);
    return e.json(502, { message: "NaMi nicht erreichbar: " + String(err) });
  }

  namiLogout(session.cookieStr);
  if (res.statusCode !== 200) return e.json(502, { message: "NaMi Mitgliederliste fehlgeschlagen (HTTP " + res.statusCode + ")" });
  var data = res.json;
  if (!data || !data.success) return e.json(502, { message: "NaMi Mitgliederliste fehlgeschlagen" });
  return e.json(200, { items: data.data || [], total: data.totalEntries || 0 });
});

routerAdd("GET", "/api/nami/members/{id}", (e) => {
  if (!e.requestInfo().auth || e.requestInfo().auth.collection().name !== "users") {
    return e.json(401, { message: "Unauthorized" });
  }
  const { namiSession, namiLogout, NAMI_BASE } = require(`${__hooks}/nami.js`);
  var memberId = e.request.pathValue("id");

  var session;
  try { session = namiSession(); } catch (err) { return e.json(502, { message: String(err) }); }

  var res;
  try {
    res = $http.send({
      url: NAMI_BASE + "/nami/mitglied/filtered-for-navigation/gruppierung/gruppierung/" + session.groupId + "/" + memberId,
      method: "GET",
      headers: { "Cookie": session.cookieStr },
    });
  } catch (err) {
    namiLogout(session.cookieStr);
    return e.json(502, { message: "NaMi nicht erreichbar: " + String(err) });
  }

  namiLogout(session.cookieStr);
  if (res.statusCode !== 200) return e.json(502, { message: "NaMi Mitglied fehlgeschlagen (HTTP " + res.statusCode + ")" });
  var data = res.json;
  if (!data || !data.success) return e.json(404, { message: "Mitglied nicht gefunden" });
  return e.json(200, data.data);
});

routerAdd("GET", "/api/nami/stats", (e) => {
  if (!e.requestInfo().auth || e.requestInfo().auth.collection().name !== "users") {
    return e.json(401, { message: "Unauthorized" });
  }
  const { namiSession, namiLogout, NAMI_BASE } = require(`${__hooks}/nami.js`);

  var session;
  try { session = namiSession(); } catch (err) { return e.json(502, { message: String(err) }); }

  var res;
  try {
    res = $http.send({
      url: NAMI_BASE + "/dashboard/stats/stats",
      method: "GET",
      headers: { "Cookie": session.cookieStr },
    });
  } catch (err) {
    namiLogout(session.cookieStr);
    return e.json(502, { message: "NaMi nicht erreichbar: " + String(err) });
  }

  namiLogout(session.cookieStr);
  if (res.statusCode !== 200) return e.json(502, { message: "NaMi Stats fehlgeschlagen (HTTP " + res.statusCode + ")" });
  var data = res.json;
  if (!data || !data.success) return e.json(502, { message: "NaMi Stats fehlgeschlagen" });
  return e.json(200, data.data);
});

routerAdd("DELETE", "/api/invites/{id}", (e) => {
  const info = e.requestInfo();

  if (!info.auth) {
    return e.json(401, { message: "Unauthorized" });
  }

  const inviteId = e.request.pathValue("id");

  try {
    const invite = $app.findRecordById("invites", inviteId);

    if (invite.getString("email") !== info.auth.getString("email")) {
      return e.json(403, { message: "Forbidden" });
    }

    $app.delete(invite);
    return e.json(200, {});
  } catch (_) {
    return e.json(404, { message: "Not found" });
  }
});