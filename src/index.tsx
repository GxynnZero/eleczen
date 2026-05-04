/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';
import { Route, Router, useLocation } from '@solidjs/router';
import { Show } from 'solid-js';

import Home from './pages/home';
import EditorPage from './pages/editor';
import Login from './pages/login';
import Signup from './pages/signup';
import Tools from './pages/tools';
import Debug from './pages/debug';
import SearchPage from './pages/search';
import Profile from './pages/profile';
import NotFound from './pages/not-found';
import About from './pages/about';
import Terms from './pages/terms';
import Scanner from './pages/tools/scanner';
import Recognizer from './pages/tools/recognizer';
import Ohm from './pages/tools/ohm';
import Resistor from './pages/tools/resistor';
import Capacitor from './pages/tools/capacitor';
import UploadComponent from './pages/upload-component';
import TopBar from './components/topbar';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

function AppLayout(props: any) {
  const location = useLocation();
  
  // Conditionally hide topbar for debug and publish pages
  const hideTopbar = () => {
    const path = location.pathname;
    return path.startsWith('/debug') || path.startsWith('/publish');
  };

  return (
    <>
      <Show when={!hideTopbar()}>
        <TopBar />
      </Show>
      {props.children}
    </>
  );
}

render(() => (
  <Router root={AppLayout}>
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
    <Route path="/publish" component={UploadComponent} />
    <Route path="/publish/:id" component={UploadComponent} />
    <Route path="/debug" component={Debug} />
    <Route path="*404" component={NotFound} />
  </Router>
), root!);
