// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { spawn } = require('child_process');

let mainWindow;
const userDocuments = path.join(os.homedir(), 'Documents');
const configPath = path.join(userDocuments, 'ScannerApp');
const historyFile = path.join(configPath, 'scan_history.json');
const defaultScanPath = path.join(userDocuments, 'Scans');

// Créer les dossiers nécessaires
async function ensureDirectories() {
  await fs.ensureDir(configPath);
  await fs.ensureDir(defaultScanPath);
}

// Gestion de l'historique
async function loadScanHistory() {
  try {
    if (await fs.pathExists(historyFile)) {
      return await fs.readJson(historyFile);
    }
    return [];
  } catch (error) {
    return [];
  }
}

async function saveScanHistory(history) {
  await fs.writeJson(historyFile, history, { spaces: 2 });
}

async function addScanToHistory(fileName, filePath, scanner) {
  const history = await loadScanHistory();
  let fileSize = 0;
  
  try {
    const stats = await fs.stat(filePath);
    fileSize = stats.size;
  } catch (error) {
    // Fichier introuvable
  }
  
  const newScan = {
    fileName,
    filePath,
    scanDate: new Date().toISOString(),
    scanner,
    fileSize
  };
  
  history.unshift(newScan);
  const limitedHistory = history.slice(0, 100);
  await saveScanHistory(limitedHistory);
  return limitedHistory;
}

// Fonction pour obtenir la liste des scanners disponibles
function getAvailableScanners() {
  return new Promise((resolve, reject) => {
    const psScript = `
      try {
        $deviceManager = New-Object -ComObject WIA.DeviceManager
        $devices = $deviceManager.DeviceInfos
        $scanners = @()
        
        foreach ($device in $devices) {
          if ($device.Type -eq 1) {  # Scanner device type
            $scannerInfo = @{
              DeviceID = $device.DeviceID
              Name = $device.Properties("Name").Value
              Manufacturer = $device.Properties("Manufacturer").Value
              Description = $device.Properties("Description").Value
            }
            $scanners += $scannerInfo
          }
        }
        
        if ($scanners.Count -gt 0) {
          $scanners | ConvertTo-Json -Depth 2
        } else {
          Write-Output "NO_SCANNERS"
        }
      } catch {
        Write-Output "ERROR: $($_.Exception.Message)"
      }
    `;
    
    const powershell = spawn('powershell.exe', ['-Command', psScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let error = '';
    
    powershell.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    powershell.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    powershell.on('close', (code) => {
      if (output.includes('NO_SCANNERS')) {
        resolve([]);
      } else if (output.includes('ERROR:')) {
        reject(new Error(error || 'Erreur lors de la récupération des scanners'));
      } else {
        try {
          const scanners = JSON.parse(output.trim());
          resolve(Array.isArray(scanners) ? scanners : [scanners]);
        } catch (parseError) {
          reject(new Error('Erreur lors de l\'analyse des données des scanners'));
        }
      }
    });
  });
}

// Fonction de scan utilisant PowerShell avec sélection de scanner
function startScan(outputPath, selectedScannerId = null) {
  return new Promise((resolve, reject) => {
    const extension = path.extname(outputPath).toLowerCase();
    let tempPath = outputPath;
    
    if (extension === '.pdf') {
      tempPath = outputPath.replace(/\.pdf$/, '.png');
    }
    
    // Script PowerShell pour le scan avec sélection de scanner
    const psScript = `
      try {
        $deviceManager = New-Object -ComObject WIA.DeviceManager
        $device = $null
        
        if ("${selectedScannerId}" -ne "" -and "${selectedScannerId}" -ne "null") {
          # Utiliser le scanner sélectionné
          try {
            $device = $deviceManager.DeviceInfos("${selectedScannerId}").Connect()
          } catch {
            Write-Output "DEVICE_NOT_FOUND"
            exit
          }
        } else {
          # Permettre à l'utilisateur de choisir le scanner
          $wia = New-Object -ComObject WIA.CommonDialog
          $device = $wia.ShowSelectDevice()
        }
        
        if ($device) {
          $item = $device.Items(1)
          $wia = New-Object -ComObject WIA.CommonDialog
          $image = $wia.ShowTransfer($item)
          
          if ($image) {
            $image.SaveFile("${tempPath.replace(/\\/g, '\\\\')}")
            
            if ("${extension}" -eq ".pdf" -and (Test-Path "${tempPath.replace(/\\/g, '\\\\')}")) {
              try {
                $word = New-Object -ComObject Word.Application
                $word.Visible = $false
                $doc = $word.Documents.Add()
                $selection = $word.Selection
                $selection.InlineShapes.AddPicture("${tempPath.replace(/\\/g, '\\\\')}")
                $doc.SaveAs2("${outputPath.replace(/\\/g, '\\\\')}", 17)
                $doc.Close()
                $word.Quit()
                Remove-Item "${tempPath.replace(/\\/g, '\\\\')}" -ErrorAction SilentlyContinue
              } catch {
                Copy-Item "${tempPath.replace(/\\/g, '\\\\')}" "${outputPath.replace(/\\/g, '\\\\')}" -Force
              }
            }
            
            Write-Output "SUCCESS"
          } else {
            Write-Output "CANCELLED"
          }
        } else {
          Write-Output "NO_DEVICE"
        }
      } catch {
        Write-Output "ERROR: $($_.Exception.Message)"
      }
    `;
    
    const powershell = spawn('powershell.exe', ['-Command', psScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let error = '';
    
    powershell.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    powershell.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    powershell.on('close', (code) => {
      if (output.includes('SUCCESS')) {
        resolve(true);
      } else if (output.includes('CANCELLED')) {
        resolve(false);
      } else if (output.includes('DEVICE_NOT_FOUND')) {
        reject(new Error('Scanner sélectionné non trouvé'));
      } else {
        reject(new Error(error || 'Échec du scan'));
      }
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize(); // Maximise la fenêtre
    mainWindow.show();
  });
}

// IPC Handlers
ipcMain.handle('get-default-path', () => defaultScanPath);

ipcMain.handle('get-scanners', async () => {
  try {
    return await getAvailableScanners();
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    defaultPath: defaultScanPath
  });
  
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('load-history', loadScanHistory);

ipcMain.handle('start-scan', async (event, { fileName, extension, outputDir, scannerId, scannerName }) => {
  const outputPath = path.join(outputDir, `${fileName}${extension}`);
  
  try {
    await fs.ensureDir(outputDir);
    const success = await startScan(outputPath, scannerId);
    
    if (success && await fs.pathExists(outputPath)) {
      const usedScannerName = scannerName || 'Scanner sélectionné';
      await addScanToHistory(`${fileName}${extension}`, outputPath, usedScannerName);
      return { success: true, path: outputPath };
    } else {
      return { success: false, error: 'Scan annulé par l\'utilisateur' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-file', async (event, filePath) => {
  const { shell } = require('electron');
  try {
    await shell.showItemInFolder(filePath);
    return true;
  } catch (error) {
    return false;
  }
});

ipcMain.handle('delete-history-item', async (event, filePath) => {
  const history = await loadScanHistory();
  const newHistory = history.filter(item => item.filePath !== filePath);
  await saveScanHistory(newHistory);
  return newHistory;
});

app.whenReady().then(async () => {
  await ensureDirectories();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});