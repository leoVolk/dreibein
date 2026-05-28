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
            <title>Deine 3Bein Einladung</title>
          </head>

          <body>
            <h1>Deine 3Bein Einladung</h1>

            <p>Gut Pfad!</p>

            <p>Klicke auf den <a href="${e.app.settings().meta.appURL}/invite?id=${e.record.id}">Link</a> und fülle das Formular aus, <br/> um dich bei 3Bein anzumelden.</p>
            <p>Viel Spaß!</p>
          </body>
        </html>
    `,
    // bcc, cc and custom headers are also supported...
  })

  e.app.newMailClient().send(message)
}, "invites")