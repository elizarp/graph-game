import { Typography } from '@neo4j-ndl/react';
import Games from './game/Game';
import Ranking from './game/Ranking';

export default function Content({ activeTab }: { activeTab: string }) {
  return (
    <div className='n-bg-palette-neutral-bg-default w-full p-0.75 gap-1'>
      <Typography variant='body-medium' className='flex p-5'>
        {activeTab === 'Game' ? <Games /> : activeTab === 'Ranking' ? <Ranking /> : <></>}
      </Typography>
    </div>
  );
}
