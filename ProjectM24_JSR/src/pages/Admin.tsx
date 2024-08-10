import { Col, Layout, Row } from "antd";
import MenuAdmin from "../components/Admin/MenuAdmin";
import AdminNavbar from "../components/Admin/AdminNavbar";
import { Outlet } from "react-router-dom";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";

const { Header } = Layout;

const Admin = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={200}
        theme="light"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <MenuAdmin />
      </Sider>
      <Layout style={{ marginLeft: 195 }}>
        <Header
          style={{
            padding: 0,
            background: "#fff",
            position: "fixed",
            width: "calc(100% - 200px)",
            zIndex: 1,
          }}
        >
          <AdminNavbar />
        </Header>
        <Content
          style={{
            margin: "88px 16px 24px", // Increased top margin to accommodate fixed header
            padding: 24,
            background: "#f0f2f5",
            minHeight: 280,
          }}
        >
          <Row>
            <Col span={24}>
              <Outlet />
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;