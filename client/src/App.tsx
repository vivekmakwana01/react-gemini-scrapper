import MDEditor from "@uiw/react-md-editor";
import axios from "axios";
import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

function App() {
  const [url, setUrl] = useState<string>("");
  const [value, setValue] = useState<string>("");

  const handleSubmit = () => {
    axios.post("http://localhost:3000/ask-gemini", { url }).then((response) => {
      // eslint-disable-next-line no-console
      console.log(response.data);
      setValue(response.data);
    });
  };

  return (
    <>
      <div className="flex gap-2 p-2">
        <Input value={url} onChange={e => setUrl(e.target.value)} />
        <Button onClick={handleSubmit}>Ask Gemini</Button>
      </div>
      <div className="flex gap-2 p-2">
        <MDEditor
          value={value}
          onChange={value => setValue(value!)}
          hideToolbar={true}
          preview="edit"
          height="100%"
        />
        <div>
          <MDEditor.Markdown
            source={value}
          />
        </div>
      </div>
    </>
  );
}

export default App;
