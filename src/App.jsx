import { Route, Router } from '@solidjs/router';
import Home from './pages/home.jsx';
import EditorPage from "./pages/editor.jsx";
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import Tools from './pages/tools.jsx';

export default function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/editor" component={EditorPage} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/tools" component={Tools} />
    </Router>
  );
}