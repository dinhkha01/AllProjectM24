import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload } from "antd";
import { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import { storage } from "../../config/firebase";

const Uploadd = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [urls, setUrls] = useState<string[]>([]);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error("Please choose files to upload");
      return;
    }

    for (const file of fileList) {
      const imageRef = ref(storage, `images/${file.name}`);
      try {
        const snapshot = await uploadBytes(imageRef, file as RcFile);
        const url = await getDownloadURL(snapshot.ref);
        setUrls((prevUrls) => [...prevUrls, url]);
      } catch (err) {
        console.error(err);
        message.error(`Error uploading file ${file.name}. Please try again.`);
      }
    }

    message.success("All files uploaded successfully");
  };

  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList((prevList) => [...prevList, file]);
      return false;
    },
    fileList,
  };

  return (
    <div>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Select Files</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        style={{ marginTop: 16 }}
      >
        Upload
      </Button>
      {urls.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h5>Uploaded Files:</h5>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`uploaded file ${index + 1}`}
                width="100"
                height="100"
                style={{ margin: "5px" }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Uploadd;
