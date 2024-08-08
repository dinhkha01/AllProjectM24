import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, Typography, Divider, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { NavLink, useNavigate } from "react-router-dom";
import { login } from "../../service/Login-Register/User";

const { Title } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { isLoading, error, currentUser } = useSelector(
    (state: RootState) => state.users
  );
  console.log(currentUser);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (shouldRedirect && currentUser) {
      console.log(currentUser.email);

      timer = setTimeout(() => {
        if (currentUser.role === true) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [shouldRedirect, currentUser, navigate]);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const result = await dispatch(login(values)).unwrap();

      if (result.user.role === true) {
        message.success("Đăng nhập thành công với quyền admin!");
      } else {
        message.success("Đăng nhập thành công!");
      }
      setShouldRedirect(true);
    } catch (err) {
      message.error(
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập."
      );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #FFC0CB 0%, #FFB6C1 100%)",
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.1)",
          borderRadius: "15px",
          background: "white",
        }}
      >
        <Title level={2} style={{ textAlign: "center", color: "#FF69B4" }}>
          Đăng nhập
        </Title>
        <Divider style={{ borderColor: "#FFB6C1" }} />
        <Form
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          {/* Form items remain the same */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#FF69B4" }} />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#FF69B4" }} />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                width: "100%",
                backgroundColor: "#FF69B4",
                borderColor: "#FF69B4",
              }}
              size="large"
              loading={isLoading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
          {error && (
            <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
          )}
          <Divider plain style={{ borderColor: "#FFB6C1" }}>
            Hoặc
          </Divider>
          <Button type="link" block style={{ color: "#FF69B4" }}>
            <NavLink to="/registor">Đăng ký tài khoản mới</NavLink>
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
