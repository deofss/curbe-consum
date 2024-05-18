import React from 'react';

const DirectoryInput = ({ onDirectorySelect }: { onDirectorySelect: any }) => {
  const handleDirectoryChange = (e: any) => {
    const directory = e.target.files;
    onDirectorySelect(directory);
  };
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current !== null) {
      ref.current.setAttribute('directory', '');
      ref.current.setAttribute('webkitdirectory', '');
    }
  }, [ref]);

  return (
    <input multiple type="file" ref={ref} onChange={handleDirectoryChange} />
  );
};
export default DirectoryInput;
