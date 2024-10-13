import "./index.css";
import Layout from "./Layout";
import AuthPage from "./pages/UserAccounts"; // added by kash

import { Route, Routes } from "react-router-dom";
import { Home, Sdg11, Quiz, Content, About } from "./index";

import Login from "./pages/login/Login";
import SignUp from "./pages/signup/SignUp";
import SignUpAdmin from "./pages/signup/SignUpAdmin";
import SignUpUser from "./pages/signup/SignUpUserType";
import NoticeBoard from "./pages/NoticeBoard";

import { AuthProvider } from "./AuthProvider";

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/sdg11" element={<Sdg11 />} />

          <Route path="/module/:moduleId/content" element={<Content />} />
          <Route path="/module/:moduleId/quiz" element={<Quiz />} />

          {/* added by kash */}

          <Route path="/auth" element={<AuthPage />} />
          <Route path="/noticeboard" element={<NoticeBoard />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signupadmin" element={<SignUpAdmin />} />
          <Route path="/signupuser" element={<SignUpUser />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
