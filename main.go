package main

import (
	"embed"
	"net/http"

	"github.com/ducthuy-ng/thuywebsite/controllers"
	"github.com/ducthuy-ng/thuywebsite/libs"
	_ "github.com/joho/godotenv/autoload"
	"github.com/labstack/echo/v4"
)

//go:embed posts/*.md
var postFS embed.FS

//go:embed templates
var templateFS embed.FS

func main() {
	e := echo.New()
	libs.SetupLogging(e)

	templateRender, err := libs.NewEchoTemplateRender(templateFS)
	if err != nil {
		e.Logger.Panicf("failed to load templates: %v", err)
	}
	e.Renderer = templateRender

	e.GET("/", func(c echo.Context) error { return c.Render(http.StatusOK, "index.html", nil) })
	e.GET("/blog/:id", func(c echo.Context) error { return controllers.GetPost(c, postFS) })

	e.Logger.Fatal(e.Start(":3000"))
}
