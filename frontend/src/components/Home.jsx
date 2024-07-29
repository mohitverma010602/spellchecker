import { useState } from "react";
import LoginDialog from "./LoginDailog";
import httpRequest from "../utils/network";
import "./Home.css"; // Import CSS file

const Home = () => {
  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [secondInputText, setSecondInputText] = useState("");
  const [thirdInputText, setThirdInputText] = useState(""); // New state for third text input
  const [output, setOutput] = useState("");
  const [outputFind, setOutputFind] = useState("");

  return (
    <div className="home-container">
      <LoginDialog
        visible={visible}
        onSubmit={async (e) => {
          await httpRequest({
            url: "/api/auth/login",
            method: "POST",
            payload: JSON.stringify({
              username: e.name,
              password: e.password,
            }),
          });
          setVisible(false);
        }}
        onHide={() => setVisible(false)}
      />
      <h1 className="title">Spell Check</h1>
      <p className="subtitle">Check your grammar and spelling</p>
      <div className="textarea-container">
        <div style={{ display: "flex", alignItems: "flex-start", gap: "50px" }}>
          <textarea
            className="textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter Text Here"
          ></textarea>
          <div>
            <input
              className="three-letter-input"
              value={thirdInputText}
              onChange={(e) => setThirdInputText(e.target.value)}
              placeholder="Enter Word"
            />
            <button
              className="button"
              style={{ margin: "10px 0 0 0" }}
              onClick={async () => {
                if (document.cookie.includes("accessToken")) {
                  const res = await httpRequest({
                    url: "/api/word/find", // Adjust the API endpoint
                    method: "POST",
                    payload: JSON.stringify({
                      inputText,
                      secondInputText,
                      thirdInputText,
                    }),
                  });
                  console.log(res?.data?.response);
                  setOutputFind(res?.data?.response);
                } else {
                  setVisible(true);
                }
              }}
              type="button"
            >
              Check Meaning
            </button>
          </div>
        </div>

        <div className="right-panel">
          <button
            className="button"
            onClick={async () => {
              if (document.cookie.includes("accessToken")) {
                const res = await httpRequest({
                  url: "/api/text/check-grammer", // Adjust the API endpoint
                  method: "POST",
                  payload: JSON.stringify({
                    inputText,
                    secondInputText,
                    thirdInputText,
                  }),
                });
                setOutput(JSON.parse(res?.data?.response));
              } else {
                setVisible(true);
              }
            }}
            type="button"
          >
            Check Grammer
          </button>
        </div>
      </div>
      {output && (
        <div className="output-container">
          <h2>Output</h2>
          <div>{JSON.stringify(output)}</div>
          <div>{output["corrected_sentence"]}</div>
        </div>
      )}

      <div className="output-container">
        <h2>Output</h2>
        <div>{outputFind}</div>
      </div>
    </div>
  );
};

export default Home;
