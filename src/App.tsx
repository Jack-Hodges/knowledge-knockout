import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';
import { CreateQuiz } from './pages/CreateQuiz';
import { MyQuizzes } from './pages/MyQuizzes';
import { PlayQuiz } from './pages/PlayQuiz';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';

function App() {
  const { user, setUser } = useAuthStore();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
        <Route element={<Layout />}>
          <Route path="/" element={user ? <Home /> : <Navigate to="/auth" />} />
          <Route
            path="/create"
            element={user ? <CreateQuiz /> : <Navigate to="/auth" />}
          />
          <Route
            path="/my-quizzes"
            element={user ? <MyQuizzes /> : <Navigate to="/auth" />}
          />
          <Route path="/play/:id" element={<PlayQuiz />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;