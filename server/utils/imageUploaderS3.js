const s3 = require("../config/aws");
const { v4: uuidv4 } = require("uuid");

exports.uploadImageToS3 = async (file, folder = "images") => {
  const fileExtension = file.name.split(".").pop();
  const key = `${folder}/${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.data,
    ContentType: file.mimetype,
    ACL: "public-read", // Optional: make image publicly accessible
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) return reject(err);
      resolve(data.Location); // The uploaded image URL
    });
  });
};
