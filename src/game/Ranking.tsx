import { useEffect, useState } from 'react';
import { Label, Typography, DataGrid } from '@neo4j-ndl/react';

import { setDriver, runRecoQuery } from '../shared/utils/Driver';

import ConnectionModal from '../shared/ComponentModal';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

type RankingItem = {
  id: string
  name: string
  level: number
}

let rankingData: RankingItem[] = []

const columnHelper = createColumnHelper<RankingItem>()

const columns = [
  columnHelper.accessor('name', {
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('level', {
    cell: info => info.getValue(),
    footer: info => info.column.id,
  })
]

export default function Ranking() {
  //const { colorMode } = useContext(ThemeWrapperContext);
  const [init, setInit] = useState<boolean>(false);
  const [openConnection, setOpenConnection] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [data, setData] = useState(() => [...rankingData])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    if (!init) {
      let session = localStorage.getItem('neo4j-connection');
      if (session) {
        let neo4jConnection = JSON.parse(session);
        setDriver(neo4jConnection.uri, neo4jConnection.user, neo4jConnection.password).then((isSuccessful: boolean) => {
          setConnectionStatus(isSuccessful);
        });
      }

      getRankingQuery();
      setInit(true);
    }
  });


  async function getRankingQuery(): Promise<void> {
    // Call the runRecoQuery function with a query string
    (async () => {
      const query = 'MATCH (p:Person) RETURN p.id as id, p.name as name, p.level as level ORDER BY p.level DESC'; // Example query
      const results = await runRecoQuery(query);
      if (results) {
        rankingData = [];
        results.forEach((result, index) => {
          console.log(`Result ${index}: ${result.id}`);
          let newItem: RankingItem = { id: result.id,  name: result.name, level: parseInt(result.level) }
          rankingData.push(newItem)
          setData(rankingData);
        });
      } else {
        console.error('Failed to retrieve results.');
      }
    })();

  }

  return (
    <div className='flex flex-col items-center'>
      <ConnectionModal
        open={openConnection}
        setOpenConnection={setOpenConnection}
        setConnectionStatus={setConnectionStatus}
      />
      <Typography variant='h2' className='flex p-5'>
        Ranking
      </Typography>

      <DataGrid isResizable={true} tableInstance={table} isKeyboardNavigable={true} styling={{
        zebraStriping: false,
        borderStyle: 'all-sides'
      }} rootProps={{
      }} />

      <Typography variant='body-medium' className='flex p-5'>
        Neo4j connection Status:
        <Typography variant='body-medium' className='ml-2.5'>
          {!connectionStatus ? <Label color='danger'>Not connected</Label> : <Label color='success'>Connected</Label>}
        </Typography>
      </Typography>

    </div>
  );
}
