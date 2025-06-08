import { Link } from "react-router";
import { Card, CardContent, CardFooter } from "./components/ui/card";
import { Icon } from "@iconify/react";

function App() {
  return (
    <div>
      <header className="m-auto flex h-72 flex-col items-center justify-center gap-3 bg-gray-700 text-white">
        <h1 className="text-6xl">thuywebsite</h1>
        <div>Web cá nhân của Thuỵ 😁</div>
      </header>
      <div className="flex flex-col items-center">
        <div className="flex max-w-lg flex-col items-start gap-4 p-4">
          <header className="gap-2">
            <h1 className="text-3xl">Công cụ</h1>
            <p className="py-2">
              Một số công cụ mà tôi đã phát triển và muốn chia sẻ với mọi người
            </p>
          </header>
          <main className="grid w-full grid-cols-2 gap-6 md:grid-cols-3">
            <Link to="/pdf-editor">
              <Card className="flex cursor-pointer flex-col items-center transition-shadow duration-300 hover:shadow-lg">
                <CardContent>
                  <Icon
                    icon="streamline-sharp:edit-pdf-remix"
                    style={{ fontSize: "3rem" }}
                  />
                </CardContent>
                <CardFooter>
                  <Link to="/pdf-editor">Gộp file PDF</Link>
                </CardFooter>
              </Card>
            </Link>
          </main>
        </div>
        <div className="flex max-w-lg flex-col items-start gap-4 p-4">
          <header className="gap-2">
            <h1 className="text-3xl">Blogs</h1>
            <p className="py-2">
              Stories and things that I would like to share with the outer world
            </p>
          </header>
          <main className="grid grid-cols-1 gap-6">
            <ul className="p-2">
              <li className="cursor-pointer list-inside list-disc hover:text-blue-500">
                <Link to="/blog/comparing_document_model_and_relational_model">
                  Comparing Document model and Relational model
                </Link>
              </li>
            </ul>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
