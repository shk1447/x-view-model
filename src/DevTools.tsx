import { PropsWithChildren, useEffect, useState, useRef } from "react";
import { devTools } from ".";

// 스타일을 위한 CSS-in-JS 유틸리티
const styles = {
  toggleButton: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#6366f1",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "none",
    fontSize: "24px",
    zIndex: 9998,
    transition: "transform 0.3s ease",
  } as React.CSSProperties,
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "80%",
    height: "100vh",
    backgroundColor: "#1e1e2e",
    color: "#f8f8f2",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    boxShadow: "-5px 0 15px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.3s ease",
    transform: "translateX(100%)",
  } as React.CSSProperties,
  panelVisible: {
    transform: "translateX(0)",
  } as React.CSSProperties,
  header: {
    padding: "16px",
    borderBottom: "1px solid #313244",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,
  closeButton: {
    background: "none",
    border: "none",
    color: "#f8f8f2",
    fontSize: "24px",
    cursor: "pointer",
  } as React.CSSProperties,
  content: {
    padding: "16px",
    flexGrow: 1,
    overflowY: "auto",
  } as React.CSSProperties,
  diagramContainer: {
    width: "100%",
    height: "calc(100vh - 100px)",
    position: "relative",
    overflow: "auto",
    padding: "20px",
  } as React.CSSProperties,
  folderBox: {
    border: "1px solid #565869",
    borderRadius: "4px",
    padding: "10px",
    margin: "10px",
    backgroundColor: "#313244",
  } as React.CSSProperties,
  folderTitle: {
    fontSize: "14px",
    marginBottom: "10px",
    color: "#cdd6f4",
  } as React.CSSProperties,
  componentBox: {
    border: "1px solid #89b4fa",
    borderRadius: "4px",
    padding: "10px",
    margin: "5px",
    backgroundColor: "#1e1e2e",
    display: "inline-block",
    minWidth: "150px",
  } as React.CSSProperties,
  modelBox: {
    border: "1px solid #f38ba8",
    borderRadius: "4px",
    padding: "10px",
    margin: "5px",
    backgroundColor: "#1e1e2e",
    display: "inline-block",
    minWidth: "150px",
    position: "relative",
  } as React.CSSProperties,
  line: {
    position: "absolute",
    backgroundColor: "#a6e3a1",
    zIndex: 1,
    pointerEvents: "none",
  } as React.CSSProperties,
  title: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "5px",
  } as React.CSSProperties,
};

// 다이어그램을 위한 인터페이스
interface DiagramNode {
  id: string;
  type: "component" | "model";
  name: string;
  paths: string[];
  refs: string[]; // 참조하는 다른 노드의 ID
}

// 모델과 컴포넌트 간의 관계 분석
const analyzeRelationships = () => {
  const components = devTools.components();
  const nodes: DiagramNode[] = [];
  const nodeMap = new Map<string, DiagramNode>();

  // 모델 노드 생성
  components.forEach((componentStates, modelContext) => {
    const modelId = `model-${modelContext.name}`;
    const modelNode: DiagramNode = {
      id: modelId,
      type: "model",
      name: modelContext.name,
      paths: [],
      refs: [],
    };
    nodes.push(modelNode);
    nodeMap.set(modelId, modelNode);

    // 컴포넌트 노드 생성 및 관계 설정
    Object.entries(componentStates).forEach(([componentName, state]) => {
      const componentId = `comp-${componentName}`;

      // 이미 존재하는 노드인지 확인
      let componentNode = nodeMap.get(componentId);
      if (!componentNode) {
        componentNode = {
          id: componentId,
          type: "component",
          name: componentName,
          paths: state.paths,
          refs: [modelId], // 모델 참조
        };
        nodes.push(componentNode);
        nodeMap.set(componentId, componentNode);
      } else {
        // 이미 존재하는 경우 참조 추가
        if (!componentNode.refs.includes(modelId)) {
          componentNode.refs.push(modelId);
        }
      }

      // 모델에서 컴포넌트 참조 추가
      if (!modelNode.refs.includes(componentId)) {
        modelNode.refs.push(componentId);
      }
    });
  });

  return nodes;
};

// 폴더 구조로 노드 그룹화
const groupNodesByFolder = (nodes: DiagramNode[]) => {
  const folderGroups: Record<string, DiagramNode[]> = {};

  // 폴더 없는 노드는 'root'에 배치
  folderGroups["root"] = [];

  nodes.forEach((node) => {
    if (node.type === "component" && node.paths.length > 0) {
      // 첫 번째 폴더 이름을 그룹 키로 사용
      const folderKey = node.paths[0] || "root";

      if (!folderGroups[folderKey]) {
        folderGroups[folderKey] = [];
      }

      folderGroups[folderKey].push(node);
    } else {
      // 모델은 별도의 'models' 폴더에 그룹화
      if (!folderGroups["models"]) {
        folderGroups["models"] = [];
      }

      if (node.type === "model") {
        folderGroups["models"].push(node);
      } else {
        folderGroups["root"].push(node);
      }
    }
  });

  return folderGroups;
};

// 메인 DevTools 컴포넌트
export const DevTools = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [folderGroups, setFolderGroups] = useState<
    Record<string, DiagramNode[]>
  >({});
  const panelRef = useRef<HTMLDivElement | null>(null);

  // 패널 엘리먼트 생성 및 관리
  useEffect(() => {
    // 패널 엘리먼트가 없으면 생성
    if (!panelRef.current) {
      const div = document.createElement("div");
      div.id = "x-view-model-devtools-panel";
      document.body.appendChild(div);
      panelRef.current = div;
    }

    // 컴포넌트 언마운트 시 패널 엘리먼트 제거
    return () => {
      if (panelRef.current && document.body.contains(panelRef.current)) {
        document.body.removeChild(panelRef.current);
      }
    };
  }, []);

  // 관계 데이터 분석
  useEffect(() => {
    if (isOpen) {
      const updatedNodes = analyzeRelationships();
      setNodes(updatedNodes);
      setFolderGroups(groupNodesByFolder(updatedNodes));
    }
  }, [isOpen]);

  // 패널 HTML 렌더링 및 업데이트
  useEffect(() => {
    if (!panelRef.current) return;

    // 패널 스타일 업데이트
    const panelStyle = {
      ...styles.panel,
      ...(isOpen ? styles.panelVisible : {}),
    };

    Object.assign(panelRef.current.style, panelStyle);

    // 패널 내용 렌더링
    panelRef.current.innerHTML = `
      <div style="
        padding: 16px;
        border-bottom: 1px solid #313244;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <h2>X-View-Model DevTools</h2>
        <button id="x-view-model-devtools-close" style="
          background: none;
          border: none;
          color: #f8f8f2;
          font-size: 24px;
          cursor: pointer;
        ">×</button>
      </div>
      
      <div style="
        padding: 16px;
        flex-grow: 1;
        overflow-y: auto;
        height: calc(100vh - 60px);
      ">
        <div id="x-view-model-devtools-diagram" style="
          width: 100%;
          height: 100%;
          position: relative;
          overflow: auto;
          padding: 20px;
        "></div>
      </div>
    `;

    // 닫기 버튼 이벤트 핸들러
    const closeButton = document.getElementById("x-view-model-devtools-close");
    if (closeButton) {
      closeButton.onclick = () => setIsOpen(false);
    }

    // 다이어그램 컨테이너
    const diagramContainer = document.getElementById(
      "x-view-model-devtools-diagram"
    );
    if (diagramContainer) {
      // 폴더 그룹 렌더링
      diagramContainer.innerHTML = "";

      Object.entries(folderGroups).forEach(([folderName, folderNodes]) => {
        const folderBox = document.createElement("div");
        Object.assign(folderBox.style, styles.folderBox);

        const folderTitle = document.createElement("div");
        Object.assign(folderTitle.style, styles.folderTitle);
        folderTitle.textContent =
          folderName === "root"
            ? "Other Components"
            : folderName === "models"
            ? "View Models"
            : `Folder: ${folderName}`;

        folderBox.appendChild(folderTitle);

        // 노드 렌더링
        folderNodes.forEach((node) => {
          const nodeBox = document.createElement("div");
          Object.assign(
            nodeBox.style,
            node.type === "model" ? styles.modelBox : styles.componentBox
          );
          nodeBox.id = node.id;

          const nodeTitle = document.createElement("div");
          Object.assign(nodeTitle.style, styles.title);
          nodeTitle.textContent = node.name;

          const nodeType = document.createElement("div");
          nodeType.textContent =
            node.type === "model" ? "View Model" : "Component";

          nodeBox.appendChild(nodeTitle);
          nodeBox.appendChild(nodeType);
          folderBox.appendChild(nodeBox);
        });

        diagramContainer.appendChild(folderBox);
      });

      // 연결선 그리기 (setTimeout으로 박스 렌더링이 완료된 후 실행)
      setTimeout(() => {
        nodes.forEach((node) => {
          node.refs.forEach((refId) => {
            drawConnection(node.id, refId);
          });
        });
      }, 100);
    }
  }, [isOpen, nodes, folderGroups]);

  // 연결선 그리기 함수
  const drawConnection = (fromId: string, toId: string) => {
    const fromElement = document.getElementById(fromId);
    const toElement = document.getElementById(toId);

    if (!fromElement || !toElement) return;

    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();

    // 시작점과 끝점 계산
    const fromX = fromRect.left + fromRect.width / 2;
    const fromY = fromRect.top + fromRect.height / 2;
    const toX = toRect.left + toRect.width / 2;
    const toY = toRect.top + toRect.height / 2;

    // 라인 중심점 및 각도 계산
    const centerX = (fromX + toX) / 2;
    const centerY = (fromY + toY) / 2;
    const angle = (Math.atan2(toY - fromY, toX - fromX) * 180) / Math.PI;
    const length = Math.sqrt(
      Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2)
    );

    // 라인 엘리먼트 생성
    const line = document.createElement("div");
    Object.assign(line.style, {
      ...styles.line,
      width: `${length}px`,
      height: "2px",
      left: `${centerX - length / 2}px`,
      top: `${centerY}px`,
      transform: `rotate(${angle}deg)`,
      position: "absolute",
      backgroundColor: "#a6e3a1",
      zIndex: 1,
    });

    const diagramContainer = document.getElementById(
      "x-view-model-devtools-diagram"
    );
    if (diagramContainer) {
      diagramContainer.appendChild(line);
    }
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {children}

      <button
        style={{
          ...styles.toggleButton,
          transform: isOpen ? "rotate(45deg)" : "none",
        }}
        onClick={togglePanel}
        aria-label="Toggle DevTools"
      >
        +
      </button>
    </>
  );
};
