import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { authUser } from "../redux/actions/userActions";
import { BASE_URL } from "../config";
import { useAuthContext } from "./AuthProvider";
export const Authentication: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { csrf } = useAuthContext();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (username === "") {
      toast("Please Input Username", {
        type: toast.TYPE.WARNING,
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }

    if (password === "") {
      toast("Please Input Password", {
        type: toast.TYPE.WARNING,
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    try {
      axios.defaults.xsrfCookieName = "csrftoken";
      axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";

      const response = await axios.post(
        `${BASE_URL}/user/login/`,
        {
          username,
          password,
        },
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-CSRFToken": csrf, // Replace getCsrfToken() with the function to retrieve the CSRF token
          },
        }
      );
      if (response.status === 200) {
        const { email } = response.data;
        dispatch(authUser(email));
        navigate("/products");
      } else {
        console.log(response);
      }
    } catch (err) {
      toast("Invalid credentials", {
        type: toast.TYPE.WARNING,
        position: toast.POSITION.TOP_CENTER,
      });
    }

    setUsername("");
    setPassword("");
  };

  return (
    <Form className="d-flex justify-content-center align-items-center flex-column w-25 m-auto mt-5 pt-5">
      <Form.Group controlId="formBasicUsername" className="w-100">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter user name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formBasicPassword" className="w-100 mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>

      <Button
        variant="primary"
        type="button"
        onClick={handleLogin}
        className="w-100"
      >
        Login
      </Button>
    </Form>
  );
};
