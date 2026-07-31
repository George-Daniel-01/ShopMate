import { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { createCategory } from "../categorySlice";
import { toggleCreateCategoryModal } from "../../../app/extraSlice";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";

const CreateCategoryModal = () => {
  const { actionLoading } = useAppSelector((state) => state.category);
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const addImage = (files: File[]) => {
    if (files.length === 0) return;
    setImage(files[0]);
    setPreview(URL.createObjectURL(files[0]));
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) addImage([file]);
        break;
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a category name.");
    if (actionLoading) return;
    const data = new FormData();
    data.append("name", name);
    if (image) data.append("image", image);
    dispatch(createCategory(data));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4" onPaste={handlePaste}>
      <div className="bg-card rounded-lg border border-border shadow-sm w-full max-w-md p-6 relative">
        <button onClick={() => { if (!actionLoading) dispatch(toggleCreateCategoryModal()); }} className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 text-xl">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-center">Create New Category</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Category Name *</label>
            <input type="text" placeholder="e.g. Electronics" value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-4 py-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Category Image</label>
            <div className="border-2 border-dashed border-input rounded-md p-4 text-center hover:border-gray-400 transition-colors">
              <p className="text-muted-foreground text-sm mb-2">Paste (Ctrl+V) - Drag & Drop - or Choose File</p>
              <input type="file" accept="image/*" onChange={(e) => addImage(Array.from(e.target.files ?? []))} className="hidden" id="categoryFileInput" />
              <label htmlFor="categoryFileInput" className="bg-muted hover:bg-muted px-4 py-2 rounded cursor-pointer text-sm">Choose File</label>
            </div>
            {preview && (
              <div className="flex gap-2 mt-2 flex-wrap">
                <div className="relative">
                  <img src={preview} alt="" className="w-20 h-20 object-cover rounded border" />
                  <button type="button" onClick={() => { setImage(null); setPreview(null); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">x</button>
                </div>
              </div>
            )}
          </div>
          <button type="submit" disabled={actionLoading} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-border disabled:cursor-not-allowed text-primary-foreground py-2 px-6 rounded-md">
            {actionLoading ? <><LoaderCircle className="w-6 h-6 animate-spin" /> Creating...</> : "Add New Category"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryModal;
