package main

import (
	"log/slog"
	"os"

	"github.com/ducthuy-ng/thuywebsite/controllers"
	"github.com/ducthuy-ng/thuywebsite/libs"
	"github.com/ducthuy-ng/webtools"
	_ "github.com/joho/godotenv/autoload"
	"github.com/labstack/echo/v4"
)

func main() {
	configs := NewConfigs()

	e := echo.New()
	libs.SetupLogging(e)

	// Setup post
	blogController := controllers.NewBlogController(configs.PostsPath)
	e.GET("/blog/:id", blogController.GetPost)

	environment := os.Getenv("ENVIRONMENT")
	if environment == "" {
		environment = "PRODUCTION"
	}
	slog.Default().Info("System initializing", "environment", environment)

	viteConfigs := webtools.NewViteIntegrationConfigs("./ui/dist/").SetIsDevEnvironment(environment == "DEVELOPMENT")
	err := webtools.ApplyViteIntegration(e, viteConfigs)
	if err != nil {
		e.Logger.Panicf("failed to apply Vite integration: %v", err)
	}

	e.Logger.Fatal(e.Start(":3000"))
}

type Configs struct {
	TemplatePath string
	PostsPath    string
}

func NewConfigs() Configs {
	return Configs{TemplatePath: "templates", PostsPath: "posts"}
}
