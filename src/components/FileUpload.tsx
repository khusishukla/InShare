import { useState } from 'react';
import { Upload, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatFileSize } from '../lib/utils';

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setDownloadUrl('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setDownloadUrl('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get the public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from('files')
        .getPublicUrl(fileName);

      if (publicUrlData?.publicUrl) {
        setDownloadUrl(publicUrlData.publicUrl);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div 
        className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          {file ? file.name : 'Drop your file here'}
        </h3>
        {file && (
          <p className="mt-2 text-sm text-gray-500">
            {formatFileSize(file.size)}
          </p>
        )}
        <div className="mt-4">
          <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
            {file ? 'Choose another file' : 'Select a file'}
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
          {file && !downloadUrl && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          )}
        </div>
      </div>

      {downloadUrl && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900">Share this link</h4>
          <div className="mt-2 flex">
            <input
              type="text"
              readOnly
              value={downloadUrl}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
            >
              {copied ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}