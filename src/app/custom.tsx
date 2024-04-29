// Definição de tipos para os elementos do Cytoscape
export interface CytoscapeNode {
    group: 'nodes';
    data: {
        id: string;
        label: string;
    };
    position: {
        x: number;
        y: number;
    };
}

export interface CytoscapeEdge {
    group: 'edges';
    data: {
        id: string;
        source: string;
        target: string;
    };
}

export type CytoscapeElement = CytoscapeNode | CytoscapeEdge;

// Função para converter os dados JSON para o formato do Cytoscape
export function convertToCytoscapeFormat(data: Array<{ V: number[][], E: number[][] }>, graphIndex: number): CytoscapeElement[] {
    const cyElements: CytoscapeElement[] = [];
    let graph = data[graphIndex];
    // Processar vértices
    graph.V.forEach((position, index) => {
        const node: CytoscapeNode = {
            group: 'nodes',
            data: {
                id: `n${graphIndex}-${index}`,
                label: ``
            },
            position: {
                x: position[0],
                y: position[1]
            }
        };
        console.log(node);
        cyElements.push(node);
    });

    // Processar arestas
    graph.E.forEach(edge => {
        const edgeElement: CytoscapeEdge = {
            group: 'edges',
            data: {
                id: `e${graphIndex}-${edge[0]}-${edge[1]}`,
                source: `n${graphIndex}-${edge[0]}`,
                target: `n${graphIndex}-${edge[1]}`
            }
        };
        cyElements.push(edgeElement);
    });

    return cyElements;
}
