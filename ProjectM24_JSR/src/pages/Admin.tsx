import { Col, Layout, Row } from "antd";
import MenuUser from "../components/User/Menu";
import MenuR from "../components/User/MenuR";
import Navbar from "../components/User/Navbar";
import TrangChu from "../components/User/TrangChu";
import { Outlet } from "react-router-dom";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import MenuAdmin from "../components/Admin/MenuAdmin";


const Admin = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
    <Header
      style={{
        padding: 0,
        background: "#fff",
        position: "fixed",
        width: "100%",
        zIndex: 1,
      }}
    >
      <Navbar />
    </Header>
  <Layout style={{ marginTop: 65 }}>
      <Sider
        width={200}
        theme="light"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
        }}
      >
        <MenuAdmin />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#f0f2f5",
            minHeight: 280,
          }}
        >
          <Row>
            <Col span={18} offset={1}>
              <Outlet />
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  </Layout>
  )
}

export default Admin
