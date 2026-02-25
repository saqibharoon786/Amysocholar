import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { categoryService } from "@/services/categoryService";
import { FolderPlus, Loader2, Plus } from "lucide-react";

export default function Categories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      if (res.success && res.data) setCategories(res.data);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.response?.data?.message || "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      toast({ title: "Error", description: "Enter category name", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await categoryService.createCategory(name);
      if (res.success) {
        toast({ title: "Done", description: "Category added." });
        setNewName("");
        fetchCategories();
      } else {
        toast({ title: "Error", description: res.message || "Failed to add", variant: "destructive" });
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.response?.data?.message || "Failed to add category",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle = {
    background: "#1a2234",
    border: "1px solid rgba(100, 116, 139, 0.2)",
  };

  return (
    <div className="space-y-6 p-6" style={{ minHeight: "100vh" }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "#f1f5f9" }}>
          <FolderPlus className="h-7 w-7" style={{ color: "#94a3b8" }} />
          Categories
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          Add categories here. They will appear in the Book and Judgment upload dropdowns.
        </p>
      </div>

      <Card style={cardStyle} className="border-slate-700/50">
        <CardHeader>
          <CardTitle style={{ color: "#f1f5f9" }}>Add category</CardTitle>
          <CardDescription style={{ color: "#94a3b8" }}>
            New category will be available in book and judgment forms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                const res = await categoryService.removeDefaultCategories();
                if (res.success) {
                  toast({ title: "Done", description: res.message || "Default categories removed." });
                  fetchCategories();
                } else toast({ title: "Error", description: res.message, variant: "destructive" });
              } catch (e: any) {
                toast({ title: "Error", description: e?.response?.data?.message || "Failed", variant: "destructive" });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            Remove default / legacy categories (sirf apni create ki rehain gi)
          </Button>
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label htmlFor="category-name" style={{ color: "#cbd5e1" }}>Category name</Label>
              <Input
                id="category-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Criminal Law"
                className="max-w-sm border-slate-600 bg-slate-800/50 text-slate-100 placeholder:text-slate-400 focus-visible:ring-slate-500"
                style={{ borderColor: "rgba(100, 116, 139, 0.3)", color: "#f1f5f9" }}
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-6"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card style={cardStyle} className="border-slate-700/50">
        <CardHeader>
          <CardTitle style={{ color: "#f1f5f9" }}>All categories ({categories.length})</CardTitle>
          <CardDescription style={{ color: "#94a3b8" }}>Used in Book and Judgment uploads.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2" style={{ color: "#94a3b8" }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : categories.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No categories yet. Add one above.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {categories.map((name) => (
                <li key={name}>
                  <span
                    className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm"
                    style={{ borderColor: "rgba(100, 116, 139, 0.3)", backgroundColor: "#1e293b", color: "#e2e8f0" }}
                  >
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
