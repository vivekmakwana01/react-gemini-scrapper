import MDEditor from "@uiw/react-md-editor";
import axios from "axios";
import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

function App() {
  const [url, setUrl] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
    axios.post("http://localhost:3000/ask-gemini", { url }).then((response) => {
      // eslint-disable-next-line no-console
      console.log(response.data);
      setValue(response.data);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <h1 className="text-2xl font-semibold text-gray-800">Gemini Web Summarizer</h1>

          {/* URL Input and Button */}
          <div className="flex items-center gap-4">
            <Input
              className="flex-1"
              placeholder="Enter a URL..."
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={isLoading} className="relative">
              {isLoading
                ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Loading...
                    </span>
                  )
                : (
                    "Ask Gemini"
                  )}
            </Button>
          </div>

          {/* Markdown Editor and Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md shadow-sm p-2 bg-white">
              <h2 className="text-lg font-medium mb-2">Editor</h2>
              <MDEditor
                value={value}
                onChange={val => setValue(val || "")}
                hideToolbar={true}
                preview="edit"
                height={400}
              />
            </div>

            <div className="border rounded-md shadow-sm p-2 bg-white overflow-auto">
              <h2 className="text-lg font-medium mb-2">Preview</h2>
              <div className="prose max-w-none">
                <MDEditor.Markdown source={value} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
