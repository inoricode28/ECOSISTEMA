import { app, BrowserWindow } from 'electron';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// Eliminar warnings de deprecación en Node.js
process.env.NODE_NO_WARNINGS = '1';

// Emular __dirname en ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Proceso del servidor
let serverProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Ruta del servidor
  const serverPath = path.join(__dirname, '../../node_modules/http-server/bin/http-server');
  const wwwPath = path.join(__dirname, '../../apps/mobile/CordovaApp/www');

  // Iniciar servidor HTTP
  serverProcess = spawn(process.execPath, [serverPath, wwwPath, '-p', '8080']);

  // Esperar a que el servidor esté listo
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Available on')) {
      console.log('Servidor iniciado:', output);
      // Cargar URL en la ventana de Electron
      win.loadURL('http://localhost:8080');
      // Abre herramientas de desarrollo (opcional para depurar)
      // win.webContents.openDevTools();
    }
  });

  // Manejo de errores
  serverProcess.stderr.on('data', (err) => {
    console.error('Error al iniciar el servidor:', err.toString());
  });

  // Detener el servidor al cerrar la ventana
  win.on('closed', () => {
    if (serverProcess) serverProcess.kill();
  });
}

// Crear ventana al iniciar Electron
app.whenReady().then(createWindow).catch((err) => {
  console.error('Error al crear la ventana:', err);
});

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Activar ventana si no hay otras abiertas
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
