import { useState, useCallback, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { CytoscapeElement, convertToCytoscapeFormat } from './Custom'; // Importe os tipos definidos
//import LogoImg from '../assets/img/logo.jpeg';
import imgHelp from '../assets/img/graph-game-help.gif';

import { ForwardIconSolid, ArrowPathIconSolid, PlayIconSolid } from '@neo4j-ndl/react/icons';
import { Timer } from './Timer';

import { Banner, Button, Dialog, Label, Typography } from '@neo4j-ndl/react';
import StartModal from '../shared/StartModal';
import { Core, EventObject } from 'cytoscape';
import { execQuery, setDriver } from '../shared/utils/Driver';


//////
function onSegment(p: { x: number; y: number; }, q: { x: number; y: number; }, r: { x: number; y: number; }) {
  if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
    return true;
  }
  return false;
}

function orientation(p: { y: number; x: number; }, q: { y: number; x: number; }, r: { x: number; y: number; }) {
  let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (val == 0) return 0;  // colinear
  return (val > 0) ? 1 : 2; // clock or counterclock wise
}

function doIntersect(p1: { x: any; y: any; id: any; }, q1: { x: any; y: any; id: any; }, p2: { x: any; y: any; id: any; }, q2: { x: any; y: any; id: any; }) {

  if (p1.id === p2.id || p1.id === q2.id || q1.id === p2.id || q1.id === q2.id) {
    // If any of the vertices are the same, they are adjacent edges in the graph, not overlaps.
    return false;
  }

  // Find the four orientations needed for general and special cases
  let o1 = orientation(p1, q1, p2);
  let o2 = orientation(p1, q1, q2);
  let o3 = orientation(p2, q2, p1);
  let o4 = orientation(p2, q2, q1);

  // General case
  if (o1 != o2 && o3 != o4) return true;

  // Special Cases
  // p1, q1 and p2 are colinear and p2 lies on segment p1q1
  if (o1 == 0 && onSegment(p1, p2, q1)) return true;

  // p1, q1 and q2 are colinear and q2 lies on segment p1q1
  if (o2 == 0 && onSegment(p1, q2, q1)) return true;

  // p2, q2 and p1 are colinear and p1 lies on segment p2q2
  if (o3 == 0 && onSegment(p2, p1, q2)) return true;

  // p2, q2 and q1 are colinear and q1 lies on segment p2q2
  if (o4 == 0 && onSegment(p2, q1, q2)) return true;

  return false; // Doesn't fall in any of the above cases
}

const jsonData = [
  {
    "V": [[60, 210], [120, 120], [200, 140], [240, 250], [260, 180]],
    "E": [[0, 1], [1, 2], [2, 3], [1, 3], [0, 3], [2, 4], [0, 4], [3, 4]]
  },
  {
    "V": [[165, 140], [260, 270], [60, 140], [60, 270], [260, 140]],
    "E": [[0, 1], [1, 2], [2, 3], [0, 2], [0, 3], [1, 3], [0, 4], [1, 4], [4, 3]]
  },
  {
    "V": [[165, 140], [260, 270], [60, 140], [60, 270], [260, 140], [165, 270]],
    "E": [[0, 1], [1, 2], [2, 3], [0, 2], [0, 3], [3, 5], [5, 1], [0, 4], [1, 4], [4, 3], [2, 5], [5, 4]]
  },
  {
    "V": [[120, 120], [250, 120], [70, 200], [200, 200], [250, 250], [70, 330], [200, 330], [120, 250]],
    "E": [[2, 0], [0, 1], [2, 5], [5, 6], [3, 2], [3, 6], [7, 4], [1, 4], [0, 7], [3, 1], [6, 4], [5, 7]]
  },
  {
    "V": [[165, 120], [70, 180], [255, 180], [70, 270], [255, 270], [165, 330], [165, 225]],
    "E": [[0, 4], [0, 3], [5, 1], [5, 2], [3, 6], [1, 6], [2, 6], [4, 6], [0, 6], [5, 6], [3, 4], [1, 2]]
  },

  {
    "V": [[100, 100], [220, 100], [100, 220], [220, 220], [100, 340], [220, 340], [160, 160], [160, 280]],
    "E": [[0, 7], [7, 1], [4, 6], [5, 6], [2, 7], [7, 3], [2, 6], [6, 3], [7, 4], [7, 5], [6, 0], [6, 1], [0, 1], [4, 5]]
  },
  {
    "V": [[90, 80], [230, 80], [50, 180], [280, 180], [90, 280], [230, 280], [160, 370], [160, 130]],
    "E": [[7, 6], [0, 1], [2, 5], [4, 3], [4, 6], [5, 6], [0, 2], [1, 3], [0, 7], [1, 7], [2, 3], [4, 5], [1, 6], [0, 6], [4, 1], [5, 0]]
  },
  {
    "V": [[90, 120], [160, 90], [230, 120], [60, 230], [260, 230], [90, 330], [160, 360], [230, 330]],
    "E": [[0, 1], [1, 2], [2, 4], [4, 7], [6, 7], [6, 5], [5, 3], [3, 0], [0, 5], [2, 7], [0, 2], [5, 7], [3, 4], [2, 6], [5, 1], [1, 6]]
  },
  {
    "V": [[110, 380], [110, 290], [60, 350], [160, 60], [210, 380], [210, 290], [260, 350], [160, 360]],
    "E": [[0, 5], [1, 4], [1, 6], [2, 5], [2, 7], [7, 6], [2, 3], [3, 6], [1, 5], [3, 5], [3, 1], [0, 4], [0, 1], [4, 5], [3, 7]]
  },
  {
    "V": [[160, 50], [260, 200], [80, 80], [160, 360], [60, 200], [80, 320], [240, 80], [240, 320]],
    "E": [[2, 7], [6, 5], [2, 1], [6, 4], [0, 7], [0, 5], [3, 1], [3, 4], [0, 2], [0, 6], [3, 5], [7, 3], [4, 0], [0, 1], [7, 4], [5, 1], [2, 3]]
  },
  {
    "V": [[80, 80], [240, 220], [80, 350], [240, 80], [80, 220], [240, 350], [130, 140], [180, 140], [160, 300]],
    "E": [[0, 7], [7, 4], [4, 0], [6, 3], [3, 1], [1, 6], [0, 8], [3, 8], [0, 3], [2, 8], [8, 5], [5, 2], [4, 1], [7, 6], [8, 7], [8, 6], [7, 2], [6, 5]]
  },
  {
    "V": [[155, 118], [216, 136], [260, 184], [270, 248], [243, 306], [194, 338], [132, 340], [74, 310], [36, 246], [55, 184], [100, 133]],
    "E": [[0, 3], [3, 6], [6, 9], [9, 1], [1, 4], [4, 7], [7, 10], [10, 2], [2, 5], [8, 5], [0, 8]]
  },
  {
    "V": [[90, 140], [160, 110], [230, 140], [90, 230], [160, 180], [230, 230], [90, 300], [160, 340], [230, 290]],
    "E": [[0, 7], [7, 2], [1, 6], [1, 8], [3, 7], [5, 7], [1, 3], [1, 5], [4, 5], [4, 1], [4, 3], [6, 5], [8, 3], [4, 7], [5, 2], [3, 0], [8, 0], [6, 2]]
  },
  {
    "V": [[80, 80], [160, 80], [240, 80], [50, 160], [160, 160], [270, 160], [80, 300], [160, 250], [240, 300]],
    "E": [[0, 4], [4, 2], [0, 7], [2, 7], [6, 1], [1, 8], [6, 4], [8, 4], [3, 7], [7, 5], [3, 1], [1, 5], [2, 5], [3, 0], [4, 7], [3, 6], [5, 8], [6, 8], [2, 8], [6, 0]]
  },
  {
    "V": [[80, 80], [160, 80], [240, 80], [40, 320], [280, 320], [80, 240], [160, 240], [240, 240], [120, 320], [200, 320]],
    "E": [[0, 8], [8, 1], [1, 9], [2, 9], [2, 7], [7, 4], [4, 6], [6, 3], [3, 5], [0, 5], [0, 1], [1, 2], [1, 5], [1, 7], [1, 6], [3, 0], [4, 2], [5, 6], [6, 7], [8, 9], [3, 8], [4, 9]]
  },
  {
    "V": [[118, 106], [202, 106], [269, 155], [295, 234], [269, 313], [202, 362], [118, 362], [51, 313], [26, 234], [51, 155]],
    "E": [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0], [0, 5], [1, 6], [6, 2], [6, 3], [6, 4], [7, 5], [8, 5], [8, 0], [9, 1], [9, 6], [9, 7], [0, 4], [0, 3], [0, 2]]
  },
  {
    "V": [[70, 110], [190, 60], [120, 60], [250, 110], [85, 180], [225, 180], [50, 300], [100, 300], [210, 300], [260, 300], [155, 390]],
    "E": [[1, 10], [2, 10], [10, 7], [10, 8], [8, 0], [7, 3], [1, 7], [2, 8], [7, 8], [3, 0], [1, 4], [2, 5], [4, 6], [5, 9], [6, 3], [9, 0], [4, 7], [5, 8], [6, 7], [8, 9], [10, 4], [5, 10], [5, 0], [4, 3]]
  },
  {
    "V": [[60, 120], [155, 190], [250, 120], [60, 220], [250, 220], [60, 320], [155, 250], [250, 320], [120, 160], [190, 160], [120, 280], [190, 280]],
    "E": [[0, 2], [0, 10], [10, 11], [11, 2], [5, 8], [8, 9], [9, 7], [5, 7], [8, 1], [9, 1], [6, 10], [6, 11], [6, 0], [6, 2], [1, 5], [1, 7], [6, 3], [1, 4], [3, 4], [6, 4], [3, 1], [0, 3], [3, 5], [2, 4], [4, 7]]
  },
  {
    "V": [[60, 100], [155, 100], [250, 100], [155, 40], [155, 160], [155, 280], [60, 340], [155, 340], [250, 340], [155, 400], [60, 220], [155, 220], [250, 220]],
    "E": [[0, 11], [11, 2], [4, 10], [4, 12], [12, 5], [10, 5], [11, 6], [11, 8], [0, 3], [3, 2], [9, 6], [9, 8], [10, 1], [10, 7], [7, 12], [12, 1], [3, 8], [3, 6], [1, 3], [7, 9], [3, 12], [7, 6], [7, 8], [4, 1], [5, 7], [10, 3]]
  },
  {
    "V": [[60, 80], [255, 80], [80, 160], [160, 120], [235, 160], [80, 210], [160, 180], [235, 210], [160, 240], [80, 260], [160, 300], [235, 260], [60, 340], [255, 340]],
    "E": [[0, 6], [6, 1], [12, 8], [8, 13], [0, 3], [3, 1], [12, 10], [10, 13], [2, 3], [3, 4], [9, 10], [10, 11], [2, 8], [8, 4], [9, 6], [6, 11], [5, 6], [6, 7], [5, 8], [7, 8], [0, 2], [9, 12], [1, 4], [11, 13], [4, 2], [9, 11], [0, 1], [12, 13], [5, 9], [4, 7]]
  }
];

let graphIndex = 0;
if (typeof window !== "undefined") {
  graphIndex = parseInt(window.localStorage.getItem("graphIndex") || "0");
}
let CYTOSCAPE_ELEMENTS: CytoscapeElement[] = convertToCytoscapeFormat(jsonData, graphIndex);

interface Message {
  type: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
  content: string;
}

export default function Games() {
  const [nextPhaseDisabled, setNextPhaseDisabled] = useState(true);
  const [startDisabled, setStartDisabled] = useState(false);

  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [openHelp, setOpenHelp] = useState<boolean>(true);
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  useEffect(() => {
    if (userName) {
      resetTimer();
      myCyRef.nodes().grabify();
      setStartDisabled(true);
    } else {
      myCyRef.nodes().ungrabify();
    }
  }, [userName]);

  useEffect(() => {
    if (userName && timerExpired) {
      blockGraph();
      setGameEnded(true);
      setMessage({
        type: 'danger',
        content: `Game over!!! Level achieved: ${graphIndex}`,
      });
    }
  }, [timerExpired]);

  useEffect(() => {
    if (!init) {
      let session = localStorage.getItem('neo4j-connection');
      if (session) {
        let neo4jConnection = JSON.parse(session);
        setDriver(neo4jConnection.uri, neo4jConnection.user, neo4jConnection.password).then((isSuccessful: boolean) => {
          setConnectionStatus(isSuccessful);
        });
      }

      setInit(true);
    }
  });

  function resetPhase() {
    window.localStorage.setItem("graphIndex", "0");
    window.location.reload();
  }

  const toogleOpenHelp = () => {
    setOpenHelp(!openHelp);
  }

  function checkForOverlappingEdges(cy: { edges: () => any; elements: () => any; }) {
    if(gameEnded) return;

    let edges = cy.edges();
    let win = true;
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        let edge1 = edges[i];
        let edge2 = edges[j];

        let p1 = edge1.source().position();
        let q1 = edge1.target().position();
        let p2 = edge2.source().position();
        let q2 = edge2.target().position();

        if (doIntersect({ x: p1.x, y: p1.y, id: edge1.source().id() }, { x: q1.x, y: q1.y, id: edge1.target().id() },
          { x: p2.x, y: p2.y, id: edge2.source().id() }, { x: q2.x, y: q2.y, id: edge2.target().id() })) {
          //console.log('Overlapping edges found:', edge1.id(), edge2.id(), edge1.source().id(), edge1.target().id(), edge2.source().id(), edge2.target().id());
          win = false;
          break;
          // Handle overlapping case
        }
      }
    }
    
    if (win) {
      let elems = cy.elements();
      elems.forEach((element: { style: (arg0: string, arg1: string) => void; }) => {
        element.style('background-color', '#8FE3E8');
        element.style('line-color', '#8FE3E8');
        element.style('border-color', '#8FE3E8');
      });

      setMessage({
        type: 'success',
        content: `Great!!!`,
      });
      setNextPhaseDisabled(false);
    }
  }

  const [expiryTimestamp, setExpiryTimestamp] = useState(new Date());

  const resetTimer = useCallback(() => {
    setTimerExpired(false);
    const newTime = new Date();
    newTime.setSeconds(newTime.getSeconds() + 120); // Adicione 120 segundos ao tempo atual
    setExpiryTimestamp(newTime);
  }, []);

  function start(): void {
    setOpenHelp(false);
    //myCyRef.nodes().grabify();
    setIsStartModalOpen(true);
  }

  let myCyRef: Core;

  function blockGraph() {
    myCyRef.nodes().ungrabify();
    myCyRef.elements().remove();
    myCyRef.destroy();
    setNextPhaseDisabled(true);
  }

  function nextPhase() {
    if (timerExpired || !userName || gameEnded) {
      blockGraph();
      return;
    }
    graphIndex = parseInt(window.localStorage.getItem("graphIndex") || "-1");
    graphIndex++;
    window.localStorage.setItem("graphIndex", graphIndex.toString());
    CYTOSCAPE_ELEMENTS = convertToCytoscapeFormat(jsonData, graphIndex);
    
    myCyRef.elements().remove();
    myCyRef.add(CYTOSCAPE_ELEMENTS);
    setNextPhaseDisabled(true);
    setMessage(null);

    const { uri, user, password } = JSON.parse(localStorage.getItem('neo4j-connection') ?? '') ?? {};
    setDriver(uri, user, password);

    (async () => {
      const query = `MERGE (p:Person {id:'${userName}'}) SET p.level = ${graphIndex}  RETURN p`;
      const results = await execQuery(query);
      if (!results) {
        console.error('Failed to retrieve results.');
      }
    })();
    //window.location.reload();
  }

  function barrier(cy: Core, e: EventObject) {
    let tg = e.target;
    if (tg.group != undefined && tg.group() == 'nodes') {
        let w = cy.width();
        let h = cy.height();
        if (tg.position().x > w) tg.position().x = w;
        if (tg.position().x < 0) tg.position().x = 0;
        if (tg.position().y > h) tg.position().y = h;
        if (tg.position().y < 0) tg.position().y = 0;
    }
  }

  return (
    <div className='flex flex-col items-center'>
      <Typography variant='h2' className='flex p-5 justify-center'>
        Graph Game
      </Typography>
      <div className='Footer w-full flex content-center justify-center'>
        {startDisabled ? (
          <Button onClick={resetPhase} className="mr-4">
            <ArrowPathIconSolid className='n-w-6 n-h-6' /> &emsp; Restart
          </Button>
        ) : ("")}
        <Button onClick={start} className="mr-4" disabled={startDisabled}>
          <PlayIconSolid className='n-w-6 n-h-6' /> &emsp; Start
        </Button>
        <Button onClick={nextPhase} disabled={nextPhaseDisabled}>
          <ForwardIconSolid className='n-w-6 n-h-6' /> &emsp; Next Phase
        </Button>
      </div>
      <Typography variant='body-large' className='flex p-5 justify-center'>
        <Timer expiryTimestamp={expiryTimestamp} setTimerExpired={setTimerExpired} resetTimer={resetTimer} />
      </Typography>
      <div>
        {message && <Banner type={message.type}>{message.content}</Banner>}
      </div>
      <div className='flex flex-wrap justify-center items-center gap-x-14 gap-y-10'>
        <CytoscapeComponent
          elements={CYTOSCAPE_ELEMENTS}
          style={{ width: '600px', height: '400px', paddingLeft: '20%' }}
          layout={{
            name: 'preset',
            //directed: false,
            padding: 40,
            animate: true,
            animationDuration: 1000
            ///avoidOverlap: true,
            //nodeDimensionsIncludeLabels: false
          }}
          panningEnabled={false}
          id='myCy'
          cy={cy => {
            myCyRef = cy;

            cy.on('mousedown', (e) => {
              barrier(cy, e);
              checkForOverlappingEdges(cy);
            });
            cy.on('mouseup', (e) => {
              barrier(cy, e);
              checkForOverlappingEdges(cy);
            });
            cy.on('touchend', (e) => {
              barrier(cy, e);
              checkForOverlappingEdges(cy);
            });
          }}
        />
      </div>
      {userName ? (
        <Typography variant='h3' className='flex p-5 justify-center'>
          User name: {userName} |  Level: {graphIndex}
        </Typography>

      ) : ("")}
      <StartModal
        open={isStartModalOpen}
        setOpenStart={setIsStartModalOpen}
        getUserName={setUserName}
      />
      <Typography variant='body-medium' className='flex p-5'>
        Neo4j connection Status:
        <Typography variant='body-medium' className='ml-2.5'>
          {!connectionStatus ? <Label color='danger'>Not connected</Label> : <Label color='success'>Connected</Label>}
        </Typography>
      </Typography>
      <Dialog size='medium' open={openHelp} aria-labelledby='form-dialog-title' onClose={toogleOpenHelp}>
        <Dialog.Header id='form-dialog-title'>Welcome</Dialog.Header>
        <Dialog.Content className='n-flex n-flex-col n-gap-token-4 justify-center'>
          <div>Welcome to the Graph Game, developed by Neo4j community!</div>

          <div>The objective of the game is to complete as many levels as possible in 2 minutes. </div>

          <div>Arrange the graph so that its relationships do not intersect, following the example below:</div>
          <div>
            <img src={imgHelp} alt="Help" />
          </div>
          <div>The objective of the game is to complete as many levels as possible in 2 minutes. </div>
          <div>Click on [Start] and have fun!!!</div>
          <div className='flex flex-wrap justify-center items-center'>
            <Button onClick={start} className="mr-4" disabled={startDisabled}>
              <PlayIconSolid className='n-w-6 n-h-6' /> &emsp; Start
            </Button>
          </div>

          <Typography variant='body-small' className='ml-2.5'>Based on https://treksit.com (R.I.P.) </Typography>
        </Dialog.Content>
      </Dialog>
    </div>

  );
}


