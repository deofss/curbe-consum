const FileInput = ({ onFileSelect }: { onFileSelect: any }) => {
  const handleFileChange = (e: any) => {
    const file = e.target.files[0];

    onFileSelect(file);
  };
  return <input type="file" onChange={handleFileChange} />;
};

export default FileInput;
