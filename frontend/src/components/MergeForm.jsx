import React, { useState } from 'react';
import axios from 'axios';
import { Editor } from '@monaco-editor/react';
import { MergeLogs } from './components/MergeLogs';

function MergeForm() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [mergedCode, setMergedCode] = useState('');
  const [logs, setLogs] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleMerge = async () => {
    if (!file1 || !file2) {
      alert("Please upload both files.");
      return;
    }

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const response = await axios.post('http://localhost:8000/merge', formData);
      const { merged_file, logs, download_url } = response.data;

      setLogs(logs || []);
      setDownloadUrl(`http://localhost:8000${download_url}`);

      const mergedRes = await axios.get(download_url);
      setMergedCode(mergedRes.data);
    } catch (error) {
      alert("Merge failed.");
      console.error(error);
    }
  };

  return (
    <div className="px-6 py-8 space-y-6 max-w-5xl mx-auto text-white">
      <h2 className="text-2xl font-bold">Upload Two C# Files</h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <input type="file" accept=".cs" onChange={(e) => setFile1(e.target.files[0])} className="bg-gray-800 p-2 rounded" />
        <input type="file" accept=".cs" onChange={(e) => setFile2(e.target.files[0])} className="bg-gray-800 p-2 rounded" />
      </div>

      <button
        onClick={handleMerge}
        className="bg-gradient-to-tr from-purple-500 to-indigo-500 px-6 py-2 rounded shadow hover:opacity-90 transition"
      >
        Merge Now
      </button>

      {mergedCode && (
        <>
          <h3 className="text-xl font-semibold">Merged Code:</h3>
          <Editor
            height="400px"
            defaultLanguage="csharp"
            value={mergedCode}
            theme="vs-dark"
            options={{ readOnly: true }}
          />
          <a
            href={downloadUrl}
            download
            className="inline-block mt-4 text-sm text-blue-400 underline"
          >
            ⬇️ Download Merged File
          </a>
        </>
      )}

      <MergeLogs logs={logs} isVisible={logs.length > 0} />
    </div>
  );
}

export default MergeForm;
