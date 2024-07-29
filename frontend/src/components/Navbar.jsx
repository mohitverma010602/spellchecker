import { useCallback, useEffect, useState } from "react";
import httpRequest from "../utils/network";
import LoginDialog from "./LoginDailog";
import "./Navbar.css"; // Import CSS file for styling

const getLoginStatus = () => document.cookie.includes("accessToken");

const Navbar = () => {
  const [login, setLogin] = useState(getLoginStatus());
  const [visible, setVisible] = useState(false);
  const listener = useCallback(() => {
    setLogin(getLoginStatus());
  }, []);

  useEffect(() => {
    cookieStore.addEventListener("change", listener);
    return () => cookieStore.removeEventListener("change", listener);
  }, []);

  // Function to handle login button click
  const handleLoginClick = () => {
    setVisible(true);
  };

  // Function to handle logout button click
  const handleLogoutClick = async () => {
    await httpRequest({ url: "/api/auth/logout" });
    setLogin(false);
  };

  return (
    <nav className="navbar">
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
          setLogin(true);
        }}
        onHide={() => setVisible(false)}
      />
      {!login ? (
        <div className="auth-buttons">
          <button className="auth-button" onClick={handleLoginClick}>
            Login
          </button>
          <button className="auth-button">Register</button>
        </div>
      ) : (
        <button className="auth-button" onClick={handleLogoutClick}>
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar;
