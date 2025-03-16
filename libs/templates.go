package libs

import (
	"embed"
	"html/template"

	"github.com/ducthuy-ng/webtools"
	"github.com/labstack/echo/v4"
	"io"
)

type EchoTemplateRender struct {
	templates *template.Template
}

func NewEchoTemplateRender(templatesFS embed.FS) (*EchoTemplateRender, error) {
	templates, err := webtools.ParseFS(templatesFS, "templates")
	if err != nil {
		return nil, err
	}
	return &EchoTemplateRender{templates: templates}, nil
}

func (e *EchoTemplateRender) Render(writer io.Writer, name string, data interface{}, c echo.Context) error {
	return e.templates.ExecuteTemplate(writer, name, data)
}
