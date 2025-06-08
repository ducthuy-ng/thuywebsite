package controllers

import (
	"html/template"
	"io/fs"
	"net/http"
	"os"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
	"github.com/labstack/echo/v4"
)

var mdRenderer = html.NewRenderer(html.RendererOptions{Flags: html.CommonFlags | html.HrefTargetBlank})

type BlogController struct {
	postFS fs.FS
}

func NewBlogController(postPath string) BlogController {
	return BlogController{postFS: os.DirFS(postPath)}
}

func (controller *BlogController) GetPost(c echo.Context) error {
	id := c.Param("id")

	filePath := id + ".md"
	fileContent, err := fs.ReadFile(controller.postFS, filePath)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to read post")
	}

	parser := parser.NewWithExtensions(parser.CommonExtensions | parser.AutoHeadingIDs)
	renderedPost := string(markdown.ToHTML(fileContent, parser, mdRenderer))

	return c.Render(
		http.StatusOK, "post.html",
		map[string]any{"postContent": template.HTML(renderedPost)},
	)
}
