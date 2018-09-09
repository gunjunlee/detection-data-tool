const {app, BrowserWindow, ipcMain, ipcRenderer} = require('electron');
const fs = require('fs');
const io = require('socket.io')();

let win;

function createWindow(){
    win = new BrowserWindow({width: 800, height: 600});
    win.loadFile('index.html')

    // Open the DevTools.
    // win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
// On macOS it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
});

ipcMain.on('save-bbox', (event, bbox) => {
    console.log(bbox);
    fs.writeFile('./data/bbox/'+bbox.fileName,
         `${bbox.x0} ${bbox.y0} ${bbox.x1} ${bbox.y1}`);
    
})

ipcMain.on('getImageList', (event) => {
    fs.readdir('./data/images/', (err, dir) => {
        if (!dir) return;
        win.webContents.send('setImageList', {dir: dir});
    });
})

ipcMain.on('getDoneList', (event) => {
    fs.readdir('./data/bbox/', (err, dir) => {
        if (!dir) return;
        win.webContents.send('setDoneList', {dir: dir});
    });
})

ipcMain.on('getbbox', (event, fileName) => {
    fs.readFile('./data/bbox/'+fileName, 'utf8', (err, data) => {
        console.log(err, data);
        if(err) return
        if(!data) return
        win.webContents.send('setbbox', data);
    })
})