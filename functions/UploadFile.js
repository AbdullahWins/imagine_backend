const { storage } = require("../firebase/firebase.config");
const { UniqueNameGenerator } = require("./UniqueNameGenerator");

const UploadFile = (file, folderName) => {
  return new Promise((resolve, reject) => {
    const bucketName = process.env.FIRE_STORAGE_BUCKET_NAME;
    const bucket = storage.bucket(bucketName);
    // Generate a unique filename
    const uniqueFilename = UniqueNameGenerator(file.originalname);
    const options = {
      destination: `${folderName}/${uniqueFilename}`,
      public: true,
    };

    bucket.upload(file.path, options, (err, uploadedFile) => {
      if (err) {
        reject(err);
      } else {
        const fileUrl = uploadedFile.publicUrl();
        resolve(fileUrl);
      }
    });
  });
};

module.exports = { UploadFile };
