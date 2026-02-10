package main

import (
	"embed"
	"log"
	"os"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

//go:embed all:.output/public
var public embed.FS

func main() {
	app := pocketbase.New()

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/*", apis.Static(os.DirFS(".output/public"), true))
		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}

}