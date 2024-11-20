import React, { useState } from "react";
import styled from "styled-components";

interface ModalProps {
  targetRef: React.RefObject<HTMLDivElement>;
  isOpen: boolean;
  onClose: () => void;
}

const ModalOvelay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  z-index: 999;
`;

const ModalContainer = styled.div<{ top: number; left: number }>`
  position: absolute;
  top: ${({ top }) => `${top}px`};
  left: ${({ left }) => `${left}px`};
  display: flex;
  flex-direction: column;
  transform: translate(-50%, -50%);
  background-color: #3e3c42;
  border: 1px solid white;
  padding: 10px;
  border-radius: 8px;
  width: 300px;
`;

const ModalList = styled.li``;

const ModalDeletebutton = styled.div`
  margin-left: auto;
  fill: #111012;
  svg {
    width: 25px;
    height: 25px;
  }
`;

const Modal: React.FC<ModalProps> = ({ targetRef, isOpen, onClose }) => {
  // TypeScript에서 **React 함수형 컴포넌트(Function Component)**의 타입을 지정하는 방법
  const [position, setPosition] = useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY, // 버튼 아래쪽에 표시
        left: rect.left + window.scrollX, // 버튼의 왼쪽 정렬
      });
    }
  }, [targetRef]);
  return (
    <ModalOvelay isOpen={isOpen} onClick={onClose}>
      <ModalContainer
        top={position.top}
        left={position.left}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 클릭 이벤트가 부모 요소(예: 오버레이)로 전파되지 않도록 막음, 모달 내부 클릭해도 닫히지 않게*/}
        <ModalDeletebutton onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
              clip-rule="evenodd"
            />
          </svg>
        </ModalDeletebutton>
        <ModalList></ModalList>
      </ModalContainer>
    </ModalOvelay>
  );
};

export default Modal;
