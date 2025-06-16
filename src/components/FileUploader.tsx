"use client";

import { useState } from "react";

export function FileUploader() {
  const [url, setUrl] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload-files", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setUrl(data.url);
    } else {
      console.error("Error:", data.error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {url && (
        <>
          <p>URL del archivo:</p>
          <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
          {url.match(/\.(jpg|jpeg|png|gif|webp)$/) && <img src={url} style={{ maxWidth: 300 }} />}
        </>
      )}
    </div>
  );
}
