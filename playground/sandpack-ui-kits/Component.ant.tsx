import { Button, Card, Space, Tag } from "antd"
import { ThunderboltOutlined } from "@ant-design/icons"

export default function Component() {
  return (
    <Card size="small" style={{ maxWidth: 420 }}>
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Tag color="blue">Ant Design</Tag>
          <span style={{ color: "#5f6672", fontSize: 12 }}>SANDPACK_UI_KIT=ant</span>
        </div>
        <Button type="primary" icon={<ThunderboltOutlined />}>
          Primary
        </Button>
      </Space>
    </Card>
  )
}

