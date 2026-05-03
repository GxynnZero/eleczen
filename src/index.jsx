/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';

import { Route, Router } from '@solidjs/router';
import Home from './pages/home.jsx';
import EditorPage from "./pages/editor.jsx";
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import Tools from './pages/tools.jsx';
import Debug from './pages/debug.jsx';
import SearchPage from './pages/search.jsx';
import Profile from './pages/profile.jsx';
import NotFound from './pages/not-found.jsx';
import About from './pages/about.jsx';
import Terms from './pages/terms.jsx';
import Scanner from './pages/tools/scanner.jsx';
import Recognizer from './pages/tools/recognizer.jsx';
import Ohm from './pages/tools/ohm.jsx';
import Resistor from './pages/tools/resistor.jsx';
import Capacitor from './pages/tools/capacitor.jsx';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <Router>
      <Route path="/" component={Home} />
      <Route path="/editor" component={EditorPage} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/tools" component={Tools} />
      <Route path="/tools/search" component={SearchPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/about" component={About} />
      <Route path="/terms" component={Terms} />
      <Route path="/tools/scanner" component={Scanner} />
      <Route path="/tools/recognizer" component={Recognizer} />
      <Route path="/tools/ohm" component={Ohm} />
      <Route path="/tools/resistor" component={Resistor} />
      <Route path="/tools/capacitor" component={Capacitor} />
      <Route path="/debug" component={Debug} />
      <Route path="*404" component={NotFound} />
    </Router>, root);
