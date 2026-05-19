import { Button, Chip, Stack, TextField } from "@mui/material"

export default function Component() {
  return (
    <Stack spacing={1.5} sx={{ maxWidth: 420, p: 1.5, border: "1px solid #e2e5ea", borderRadius: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Chip label="Material UI" color="primary" size="small" />
        <span style={{ color: "#5f6672", fontSize: 12 }}>SANDPACK_UI_KIT=mui</span>
      </Stack>
      <TextField size="small" label="Поле ввода" placeholder="Привет" />
      <Button variant="contained">Contained</Button>
    </Stack>
  )
}
