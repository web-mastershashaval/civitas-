import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { SignUp } from "./pages/Auth/SignUp";
import { SignIn } from "./pages/Auth/SignIn";
import { RoleConfirmation } from "./pages/Auth/RoleConfirmation";
import { GovernanceOrientation } from "./pages/Auth/GovernanceOrientation";
import { MemberLayout } from "./components/layout/MemberLayout";
import { MemberHome } from "./pages/Member/MemberHome";
import { CommunityDirectory } from "./pages/Member/CommunityDirectory";
import { CommunityProfile } from "./pages/Member/CommunityProfile";
import { CommunityApplication } from "./pages/Member/CommunityApplication";
import { CommunityHome } from "./pages/Community/CommunityHome";
import { BoardView } from "./pages/Community/BoardView";
import { SubBoardView } from "./pages/Community/SubBoardView";
import { CreateDiscussion } from "./pages/Community/CreateDiscussion";
import { DiscussionDetail } from "./pages/Community/DiscussionDetail";
import { MemberProfile } from "./pages/Member/Profile";
import { MemberNotifications } from "./pages/Member/Notifications";
import { FacilitatorLayout } from "./components/layout/FacilitatorLayout";
import { FacilitatorDashboard } from "./pages/Facilitator/Dashboard";
import { CreateCommunity } from "./pages/Facilitator/CreateCommunity";
import { CommunityManagement } from "./pages/Facilitator/CommunityManagement";
import { ModerationPanel } from "./pages/Facilitator/ModerationPanel";
import { CommunitiesList } from "./pages/Facilitator/CommunitiesList";
import { FacilitatorProfile } from "./pages/Facilitator/Profile";
import { Notifications } from "./pages/Facilitator/Notifications";
import { MembersManagement } from "./pages/Facilitator/MembersManagement";
import { RulesList } from "./pages/Facilitator/RulesList";
import { RuleBuilder } from "./pages/Facilitator/RuleBuilder";
import { ModerationDashboard } from "./pages/Facilitator/ModerationDashboard";
import { ModerationHistory } from "./pages/Member/ModerationHistory";
import { NotFound } from "./pages/NotFound";
import { NudgeProvider } from "./components/features/NudgeProvider";
import { CommunityLayout } from "./components/layout/CommunityLayout";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ToastProvider } from "./components/ui/Toast";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NudgeProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth/signup" element={<SignUp />} />
              <Route path="/auth/signin" element={<SignIn />} />
              <Route path="/auth/role-confirmation" element={<RoleConfirmation />} />
              <Route path="/auth/governance-orientation" element={<GovernanceOrientation />} />

              <Route path="/member" element={
                <ProtectedRoute allowedRoles={['MEMBER', 'FACILITATOR', 'CO_FACILITATOR']}>
                  <MemberLayout />
                </ProtectedRoute>
              }>
                <Route path="home" element={<MemberHome />} />
                <Route path="communities" element={<CommunityDirectory />} />
                <Route path="profile" element={<MemberProfile />} />
                <Route path="profile/:username" element={<MemberProfile />} />
                <Route path="notifications" element={<MemberNotifications />} />
                <Route path="moderation-history" element={<ModerationHistory />} />
                <Route path="community/:id" element={<CommunityProfile />} />
                <Route path="community/:id/apply" element={<CommunityApplication />} />
              </Route>

              {/* Community Specific Layout - Un-nested to avoid double headers */}
              <Route path="/member/community/:id" element={
                <ProtectedRoute allowedRoles={['MEMBER', 'FACILITATOR', 'CO_FACILITATOR']}>
                  <CommunityLayout />
                </ProtectedRoute>
              }>
                <Route path="home" element={<CommunityHome />} />
                <Route path="board/:boardId" element={<BoardView />} />
                <Route path="board/:boardId/sub/:subBoardId" element={<SubBoardView />} />
                <Route path="board/:boardId/sub/:subBoardId/create" element={<CreateDiscussion />} />
                <Route path="discussion/:discussionId" element={<DiscussionDetail />} />
              </Route>

              <Route path="/facilitator" element={
                <ProtectedRoute allowedRoles={['FACILITATOR', 'CO_FACILITATOR']}>
                  <FacilitatorLayout />
                </ProtectedRoute>
              }>
                <Route path="home" element={<FacilitatorDashboard />} />
                <Route path="communities" element={<CommunitiesList />} />
                <Route path="profile" element={<FacilitatorProfile />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="moderation" element={<ModerationDashboard />} />
                <Route path="members" element={<MembersManagement />} />
                <Route path="rules" element={<RulesList />} />
                <Route path="rules/create" element={<RuleBuilder />} />
                <Route path="rules/:id/edit" element={<RuleBuilder />} />
                <Route path="create-community" element={<CreateCommunity />} />
                <Route path="community/:id/manage" element={<CommunityManagement />} />
                <Route path="community/:id/moderation" element={<ModerationPanel />} />
                <Route path="community/:id/board/:boardId" element={<BoardView />} />
                <Route path="community/:id/board/:boardId/sub/:subBoardId" element={<SubBoardView />} />
                <Route path="community/:id/discussion/:discussionId" element={<DiscussionDetail />} />
                <Route path="community/:id/board/:boardId/sub/:subBoardId/create-thread" element={<CreateDiscussion />} />
              </Route>
              {/* Placeholder routes for future implementation */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </NudgeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
