const { app, BrowserWindow } = require("electron")
const { fork } = require("child_process")
const path = require("path")

let mainWindow
let serverChild

const PORT = 3456

function startServer() {
  return new Promise((resolve) => {
    const nextBin = path.join(__dirname, "node_modules", "next", "dist", "bin", "next")

    serverChild = fork(nextBin, ["start", "-p", String(PORT)], {
      env: { ...process.env },
      stdio: "pipe",
    })

    serverChild.on("message", (msg) => {
      if (msg && (msg.ready || String(msg).includes(PORT))) resolve()
    })

    serverChild.stdout?.on("data", (data) => {
      const msg = data.toString()
      console.log("[next]", msg)
      if (msg.includes("ready") || msg.includes(PORT)) resolve()
    })

    serverChild.stderr?.on("data", (data) => {
      console.error("[next]", data.toString())
    })

    setTimeout(resolve, 10000)
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
  if (serverChild && !serverChild.killed) serverChild.kill()
  if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
  if (mainWindow === null) createWindow()
})
