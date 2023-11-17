const Client = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

const sftp_sinologi = {
  user: 'user',
  host: 'host',
  password: 'password',
  port: 22,
};

const sftp = new Client();

class FileHandler {
	constructor() {
    this.sftp = new Client();
  }

	async connect() {
    try {
      await this.sftp.connect(sftp_sinologi);
      console.log('Connected to SFTP server.');
    } catch (err) {
      console.error('Error connecting to SFTP server:', err.message);
    }
  }
	
	async disconnect() {
    try {
      await this.sftp.end();
      console.log('Disconnected from SFTP server.');
    } catch (err) {
      console.error('Error disconnecting from SFTP server:', err.message);
    }
  }

	async uploadFile(localFilePath, remoteFilePath) {
    try {
      await this.connect();
			
      await this.sftp.put(localFilePath, remoteFilePath);

      console.log('File uploaded successfully.');
    } catch (err) {
      console.error('Error uploading file:', err.message);
    } finally {
      await this.disconnect();
    }
  }
}

module.exports = FileHandler;