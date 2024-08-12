import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Divider,
  message,
  Steps,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";

import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { registerUser } from "../../service/Login-Register/User";


const { Title } = Typography;
const { Step } = Steps;

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});

  const steps = [
    {
      title: "Thông tin cá nhân",
      content: (
        <>
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#FF69B4" }} />}
              placeholder="Họ và tên"
              size="large"
            />
          </Form.Item>
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
        </>
      ),
    },
    {
      title: "Liên hệ",
      content: (
        <Form.Item
          name="phone"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input
            prefix={<PhoneOutlined style={{ color: "#FF69B4" }} />}
            placeholder="Số điện thoại"
            size="large"
          />
        </Form.Item>
      ),
    },
    {
      title: "Mật khẩu",
      content: (
        <>
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
          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#FF69B4" }} />}
              placeholder="Xác nhận mật khẩu"
              size="large"
            />
          </Form.Item>
        </>
      ),
    },
  ];

  const onFinish = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const dataToSubmit  = {
        ...formData,
        ...values,
        role: false,
        avatar: "",
        banner: "",
        friends:[],
        notyfi:[],
        date:new Date().toISOString(),
        status:true
      };
      const check = await dispatch(registerUser(dataToSubmit));
      if (registerUser.fulfilled.match(check)) {
        message.success("Đăng ký thành công!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error(check.error.message);
      }
    } catch (error) {
      message.error("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    try {
      const values = await form.validateFields();
      const { confirmPassword, ...dataToSave } = values;
      setFormData((prevData) => ({ ...prevData, ...dataToSave }));
      setCurrentStep(currentStep + 1);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FFC0CB 0%, #FFB6C1 100%)",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 600,
          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.1)",
          borderRadius: "15px",
          background: "white",
        }}
      >
        <Title
          level={2}
          style={{
            textAlign: "center",
            color: "#FF69B4",
            marginBottom: "30px",
          }}
        >
          Đăng ký
        </Title>
        <Steps current={currentStep} style={{ marginBottom: "40px" }}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={formData}
        >
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: "150px" }}
          >
            {steps[currentStep].content}
          </motion.div>
          <Form.Item style={{ marginTop: "30px" }}>
            {currentStep < steps.length - 1 && (
              <Button
                type="primary"
                onClick={nextStep}
                style={{
                  width: "100%",
                  backgroundColor: "#FF69B4",
                  borderColor: "#FF69B4",
                  height: "50px",
                  fontSize: "16px",
                }}
              >
                Tiếp theo
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  width: "100%",
                  backgroundColor: "#FF69B4",
                  borderColor: "#FF69B4",
                  height: "50px",
                  fontSize: "16px",
                }}
                loading={loading}
              >
                Đăng ký
              </Button>
            )}
            {currentStep > 0 && (
              <Button
                onClick={prevStep}
                style={{
                  marginTop: 16,
                  width: "100%",
                  height: "50px",
                  fontSize: "16px",
                }}
              >
                Quay lại
              </Button>
            )}
          </Form.Item>
        </Form>
        <Divider plain style={{ borderColor: "#FFB6C1", margin: "30px 0" }}>
          Hoặc
        </Divider>
        <Button
          type="link"
          block
          style={{ color: "#FF69B4", fontSize: "16px" }}
          disabled={loading}
        >
          <NavLink to="/"> Đã có tài khoản? Đăng nhập</NavLink>
        </Button>
      </Card>
    </div>
  );
};

export default Register;