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
                            <a href="${e.app.settings().meta.appURL}/invite?id=${e.record.id}"
                               style="display:inline-block;background-color:#16a34a;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:8px;">
                              Konto erstellen
                            </a>
                          </td>
                        </tr>
                      </table>

                      <hr style="border:none;border-top:1px solid #e4e4e7;margin:0 0 24px;" />

                      <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">
                        Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br />
                        <a href="${e.app.settings().meta.appURL}/invite?id=${e.record.id}"
                           style="color:#16a34a;word-break:break-all;">
                          ${e.app.settings().meta.appURL}/invite?id=${e.record.id}
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