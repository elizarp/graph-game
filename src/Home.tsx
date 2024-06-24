import Header from './components/Header';
import { useState } from 'react';
import Content from './Content';
import ConnectionModal from './shared/ComponentModal';

export default function QuickStarter() {
  const [activeTab, setActiveTab] = useState<string>('Game');
  const [useReco, setUseReco] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  
  return (
    <div>
      <Header
        title={'Graph Game'}
        navItems={['Game', 'Ranking']}
        useNeo4jConnect={true}
        activeNavItem={activeTab}
        setActiveNavItem={setActiveTab}
        userHeader={false}
        connectNeo4j={useReco}
        openConnectionModal={() => setIsConnectionModalOpen(true)}
        setConnectNeo4j={setUseReco}
      />
      <div className='h-full min-h-screen w-full flex'>
        <Content activeTab={activeTab} />
      </div>
      <ConnectionModal
        open={isConnectionModalOpen}
        setOpenConnection={setIsConnectionModalOpen}
        setConnectionStatus={setUseReco}
        message={{
          type: 'warning',
          content:
            'Ensure you connect to a Neo4j database containing the Recommendation dataset ( using sandbox.neo4j.com for example )',
        }}
      />
    </div>
  );
}
