import Header from './components/Header';
import { useState } from 'react';
import Content from './Content';

export default function QuickStarter() {
  const [activeTab, setActiveTab] = useState<string>('Game');

  return (
    <div>
      <Header
        title={'Graph Game'}
        navItems={['Game', 'Ranking']}
        useNeo4jConnect={false}
        activeNavItem={activeTab}
        setActiveNavItem={setActiveTab}
        userHeader={false}
      />
      <div className='h-full min-h-screen w-full flex'>
        <Content activeTab={activeTab} />
      </div>
    </div>
  );
}
