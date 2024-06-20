import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import '@neo4j-ndl/base/lib/neo4j-ds-styles.css';

import ThemeWrapper from './context/ThemeWrapper';

import Home from './Home';

//import { FileContextProvider } from './context/connectionFile';

import './ConnectionModal.css';
import PageNotFound from './components/PageNotFound';
import User from './components/User';
import Header from './components/Header';

function App() {
  //const messages = messagesData.listMessages;
  const [activeTab, setActiveTab] = useState<string>('Home');
  return (
    <BrowserRouter>
      <ThemeWrapper>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route
            path='/header-preview'
            element={
              <Header
                title='Header Component'
                navItems={['Home', 'Tab1', 'TabX']}
                useNeo4jConnect={false}
                activeNavItem={activeTab}
                setActiveNavItem={setActiveTab}
              />
            }
          />
          <Route path='/user-preview' element={<User />} />
          <Route path='*' element={<PageNotFound />} />
        </Routes>
      </ThemeWrapper>
    </BrowserRouter>
  );
}

export default App;
