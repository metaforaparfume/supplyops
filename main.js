const { app, BrowserWindow } = require("electron")
const { spawn } = require("child_process")
const path = require("path")

let mainWindow
let serverProcess

const PORT = 3456

function startServer() {
  return new Promise((resolve, reject) => {
    const nextDir = path.join(__dirname, "node_modules", ".bin", "next.cmd")
    serverProcess = spawn(nextDir, ["start", "-p", String(PORT)], {
      env: { ...process.env },
      stdio: "pipe",
      shell: true,
    })

    serverProcess.stdout.on("data", (data) => {
      const msg = data.toString()
      console.log("[next]", msg)
      if (msg.includes("ready") || msg.includes("started") || msg.includes(PORT)) resolve()
    })

    serverProcess.stderr.on("data", (data) => {
      console.error("[next]", data.toString())
    })

    serverProcess.on("error", reject)

    setTimeout(resolve, 8000)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    icon: path.join(__dirname, "public", "icons", "icon-512.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.loadURL(`http://localhost:${PORT}/login`)
  mainWindow.setTitle("SupplyOps")
}

app.whenReady().then(async () => {
  await startServer()
  createWindow()
})

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill()
  if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
  if (mainWindow === null) createWindow()
})
