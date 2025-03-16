package controllers

import (
	"embed"
	"html/template"
	"net/http"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
	"github.com/labstack/echo/v4"
)

var mdRenderer = html.NewRenderer(html.RendererOptions{Flags: html.CommonFlags | html.HrefTargetBlank})

func GetPost(c echo.Context, postFS embed.FS) error {
	id := c.Param("id")

	filePath := "posts/" + id + ".md"
	fileContent, err := postFS.ReadFile(filePath)
	if err != nil {
		return err
	}

	parser := parser.NewWithExtensions(parser.CommonExtensions | parser.AutoHeadingIDs)
	renderedPost := string(markdown.ToHTML(fileContent, parser, mdRenderer))

	return c.Render(
		http.StatusOK, "post.html",
		map[string]any{"postContent": template.HTML(renderedPost)},
	)
}
