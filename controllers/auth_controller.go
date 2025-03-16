package controllers

import (
	"html/template"
	"log/slog"
	"net/http"
)

func AddAuthController(router *http.ServeMux, pageTemplates *template.Template) {
	router.HandleFunc("GET /admin/auth/login", func(writer http.ResponseWriter, request *http.Request) {
		err := pageTemplates.ExecuteTemplate(writer, "admin/auth/login.html", nil)
		if err != nil {
			slog.Warn("failed to get main page", "err", err)
		}
	})
}
