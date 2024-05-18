import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const DirectoryInput = ({
  onDirectorySelect,
}: {
  onDirectorySelect: any;
  isLoading: boolean;
}) => {
  const handleDirectoryChange = (e: any) => {
    const directory = e.target.files;
    onDirectorySelect(directory);
  };
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current !== null) {
      ref.current.setAttribute("directory", "");
      ref.current.setAttribute("webkitdirectory", "");
    }
  }, [ref]);

  return (
    <div className="grid  w-full max-w-xs items-center gap-1.5">
      <Button asChild>
        <Label htmlFor="dosar" className="hover:cursor-pointer">
          Dosar
        </Label>
      </Button>
      <Input
        multiple
        className="hidden"
        type="file"
        ref={ref}
        onChange={handleDirectoryChange}
        id="dosar"
        placeholder="Incarcati documentele"
      />
    </div>
  );
};
export default DirectoryInput;
