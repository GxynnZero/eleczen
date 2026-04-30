import { Route, Router } from '@solidjs/router';
import Home from './pages/home.jsx';
import EditorPage from "./pages/editor.jsx";

export default function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/editor" component={EditorPage} />
      <Route path="/console" component={EditorPage} />
    </Router>
  );
}