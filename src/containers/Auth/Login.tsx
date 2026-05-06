import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import * as actions from "../../store/actions";
import "./Login.scss";
import { handleLoginApi } from "../../services/userService";
import { USER_ROLE } from "../../utils";

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errMessage, setErrMessage] = useState("");

  const handleLogin = useCallback(async () => {
    setErrMessage("");
    try {
      const data = await handleLoginApi(username, password);
      if (!data || !data.success) {
        return setErrMessage(data?.message || "Login failed");
      }
      dispatch(actions.userLoginSuccess(data.data, data.data?.token));
      console.log("Login success");

      // Redirect dựa theo roleId của user
      const roleId = data.data?.roleId;
      if (roleId === USER_ROLE.ADMIN) {
        navigate("/system");
      } else if (roleId === USER_ROLE.CLINIC_MANAGER) {
        navigate("/system/clinic-manager");
      } else if (roleId === USER_ROLE.DOCTOR) {
        navigate("/doctor/manage-schedule");
      } else {
        navigate("/");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Something went wrong. Please try again.";
      setErrMessage(msg);
      console.log("login error:", e);
    }
  }, [username, password, dispatch, navigate]);

  const handleKeyDown = useCallback(
    (event: any) => {
      if (event.key === "Enter" || event.keyCode === 13) {
        handleLogin();
      }
    },
    [handleLogin],
  );

  return (
    <div className="login_background">
      <div className="login-container">
        <div className="login-content">
          <div className="col-12 text-login">Login</div>

          <div className="col-12 form-group input-login">
            <label>Username</label>
            <input
              type="text"
              className="form-control login"
              placeholder="Enter Your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="col-12 form-group input-login">
            <label>Password</label>
            <div className="custom-input-password">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span onClick={() => setShowPassword((s) => !s)}>
                <i
                  className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                />
              </span>
            </div>
          </div>

          <div className="col-12" style={{ color: "red" }}>
            {errMessage}
          </div>

          <div className="col-12">
            <button className="btn-login" onClick={handleLogin}>
              Login
            </button>
          </div>

          <div className="col-12 forgot-password">
            <span>Forgot your password!</span>
          </div>

          <div className="col-12 text-center mt-3">
            <span className="text-other-login text-center">Or Login with:</span>
          </div>

          <div className="col-12 social-login">
            <i className="fab fa-google"></i>
            <i className="fab fa-facebook-f"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
