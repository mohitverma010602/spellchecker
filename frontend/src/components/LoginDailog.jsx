import { useState } from "react";
import "./LoginDailog.css"; // Import CSS file for styling

const LoginDialog = ({ visible, onHide, onSubmit }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle form submission
  const handleSubmit = () => {
    if (name.trim() === "" || password.trim() === "") {
      alert("Please enter both username and password");
      return;
    }
    onSubmit({ name, password });
  };

  // Return null if dialog is not visible
  if (!visible) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Login</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter username"
          className="input-field"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="input-field"
        />
        <div className="button-container">
          <button className="submit-button" onClick={handleSubmit}>
            Submit
          </button>
          <button className="cancel-button" onClick={onHide}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginDialog;
