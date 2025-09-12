
const mega = require("megajs");

const auth = {
    email: 'sbot7603@gmail.com',
    password: 'sumon@2008@9836',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246'
};

const upload = (data, name, retries = 3) => {
    return new Promise((resolve, reject) => {
        const attemptUpload = (attempt) => {
            try {
                if (!auth.email || !auth.password || !auth.userAgent) {
                    throw new Error("Missing required authentication fields");
                }

                console.log(`📤 Uploading to MEGA (attempt ${attempt}): ${name}`);

                const storage = new mega.Storage(auth, () => {
                    try {
                        const uploadStream = storage.upload({ 
                            name: name, 
                            allowUploadBuffering: true 
                        });
                        
                        data.pipe(uploadStream);
                        
                        storage.on("add", (file) => {
                            file.link((err, url) => {
                                if (err) {
                                    console.error(`❌ MEGA link generation error (attempt ${attempt}):`, err.message);
                                    storage.close();
                                    
                                    if (attempt < retries) {
                                        console.log(`🔄 Retrying upload (${attempt + 1}/${retries})...`);
                                        setTimeout(() => attemptUpload(attempt + 1), 2000);
                                    } else {
                                        reject(new Error(`Failed to generate MEGA link after ${retries} attempts: ${err.message}`));
                                    }
                                    return;
                                }
                                
                                console.log(`✅ MEGA upload successful (attempt ${attempt}):`, url);
                                storage.close();
                                resolve(url);
                            });
                        });
                        
                        uploadStream.on('error', (err) => {
                            console.error(`❌ MEGA upload stream error (attempt ${attempt}):`, err.message);
                            storage.close();
                            
                            if (attempt < retries) {
                                console.log(`🔄 Retrying upload (${attempt + 1}/${retries})...`);
                                setTimeout(() => attemptUpload(attempt + 1), 2000);
                            } else {
                                reject(new Error(`Upload stream failed after ${retries} attempts: ${err.message}`));
                            }
                        });
                        
                    } catch (uploadErr) {
                        console.error(`❌ MEGA upload initialization error (attempt ${attempt}):`, uploadErr.message);
                        storage.close();
                        
                        if (attempt < retries) {
                            console.log(`🔄 Retrying upload (${attempt + 1}/${retries})...`);
                            setTimeout(() => attemptUpload(attempt + 1), 2000);
                        } else {
                            reject(new Error(`Upload initialization failed after ${retries} attempts: ${uploadErr.message}`));
                        }
                    }
                });

                storage.on('error', (err) => {
                    console.error(`❌ MEGA storage error (attempt ${attempt}):`, err.message);
                    
                    if (attempt < retries) {
                        console.log(`🔄 Retrying upload (${attempt + 1}/${retries})...`);
                        setTimeout(() => attemptUpload(attempt + 1), 2000);
                    } else {
                        reject(new Error(`Storage connection failed after ${retries} attempts: ${err.message}`));
                    }
                });

                // Timeout for upload attempts
                setTimeout(() => {
                    if (storage) {
                        try {
                            storage.close();
                        } catch (e) {
                            console.error('Error closing storage on timeout:', e.message);
                        }
                    }
                    
                    if (attempt < retries) {
                        console.log(`⏰ Upload timeout (attempt ${attempt}), retrying...`);
                        setTimeout(() => attemptUpload(attempt + 1), 2000);
                    } else {
                        reject(new Error(`Upload timed out after ${retries} attempts`));
                    }
                }, 30000); // 30 second timeout per attempt

            } catch (err) {
                console.error(`❌ MEGA initialization error (attempt ${attempt}):`, err.message);
                
                if (attempt < retries) {
                    console.log(`🔄 Retrying upload (${attempt + 1}/${retries})...`);
                    setTimeout(() => attemptUpload(attempt + 1), 2000);
                } else {
                    reject(new Error(`Initialization failed after ${retries} attempts: ${err.message}`));
                }
            }
        };

        attemptUpload(1);
    });
};

module.exports = { upload };
