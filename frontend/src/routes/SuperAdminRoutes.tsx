// routes/superAdminRoutes.tsx
import { Routes, Route } from "react-router-dom";
import SuperAdminRoute from "@/protectedRoutes/SuperAdminProtectedRoutes";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";

// Pages
import Dashboard from "@/pages/admin/Dashboard";
import UploadBook from "@/pages/UploadBook";
import UploadJudgment from "@/pages/UploadJudgment";
import BookShop from "@/pages/superadmin/BookShop";
import BookList from "@/pages/superadmin/BookList";
import ProfileSettings from "@/pages/admin/ProfileSettings";
import ApproveBooks from "@/pages/superadmin/ApproveBooks";

// Temporary placeholder component
const UserManagement = () => <div>User Management - Coming Soon</div>;

const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <SuperAdminRoute>
            <SuperAdminLayout />
          </SuperAdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="upload" element={<UploadBook />} />
        <Route path="upload-judgment" element={<UploadJudgment />} />
        <Route path="shop" element={<BookShop />} />
        <Route path="books" element={<BookList />} />
        <Route path="approve" element={<ApproveBooks />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="profile" element={<ProfileSettings />} />
      </Route>
    </Routes>
  );
};

export default SuperAdminRoutes;
