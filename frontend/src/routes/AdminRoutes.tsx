// routes/AdminRoutes.tsx
import { Routes, Route } from "react-router-dom";
import AdminRoute from "@/protectedRoutes/AdminProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import UploadBook from "@/pages/UploadBook";
import BookShop from "@/pages/admin/BookShop";
import BookList from "@/pages/superadmin/BookList";
import ProfileSettings from "@/pages/admin/ProfileSettings";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="upload" element={<UploadBook />} />
        <Route path="shop" element={<BookShop />} />
        <Route path="books" element={<BookList />} />
        <Route path="profile" element={<ProfileSettings />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
