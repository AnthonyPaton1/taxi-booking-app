import { useState } from "react";

const EvidenceUploader = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        onUploadComplete(data.secure_url);
      } else {
        setError("Upload failed");
      }
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      setError("Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 bg-gray-100">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
      />
      {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default EvidenceUploader;
