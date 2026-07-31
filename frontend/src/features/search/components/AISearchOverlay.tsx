import { useState, useEffect } from "react";
import { Sparkles, X, Loader, Send, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { toggleAIModal } from "../../../app/popupSlice";
import { fetchProductWithAI } from "../../products/productSlice";

const AISearchOverlay = () => {
  const [prompt, setPrompt] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAIPopupOpen, aiSearching, isAISearchResult } = useAppSelector((state) => ({
    isAIPopupOpen: state.popup.isAIPopupOpen,
    aiSearching: state.product.aiSearching,
    isAISearchResult: state.product.isAISearchResult,
  }));

  useEffect(() => {
    if (searchSubmitted && !aiSearching) {
      if (isAISearchResult) {
        dispatch(toggleAIModal());
        navigate("/products", { state: { fromAISearch: true } });
      }
      setSearchSubmitted(false);
    }
  }, [searchSubmitted, aiSearching, isAISearchResult, dispatch, navigate]);

  if (!isAIPopupOpen) return null;

  const handleSearch = () => {
    if (prompt.trim() !== "") {
      setSearchSubmitted(true);
      dispatch(fetchProductWithAI(prompt));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Product Search</h3>
              <p className="text-sm text-muted-foreground">Describe what you're looking for</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(toggleAIModal())}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='e.g. "affordable running shoes under $100"'
              rows={3}
              className="w-full px-4 py-3 pr-12 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground resize-none"
              disabled={aiSearching}
            />
            <button
              onClick={handleSearch}
              disabled={!prompt.trim() || aiSearching}
              className="absolute right-3 bottom-3 p-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {aiSearching ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Try: <span className="text-foreground font-medium">&ldquo;wireless headphones under $50&rdquo;</span> or{" "}
                <span className="text-foreground font-medium">&ldquo;trendy sneakers&rdquo;</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISearchOverlay;
