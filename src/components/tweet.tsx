import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div`
  &:last-child {
    place-self: end;
  }
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Container = styled.div`
  display: flex;
  gap: 10px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border: 0;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
  display: flex;
  gap: 5px;
  svg {
    width: 15px;
  }
`;

const EditButton = styled.button`
  background-color: #03fc52;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border: 0;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  display: flex;
  gap: 5px;
  cursor: pointer;
  svg {
    width: 15px;
  }
`;

const DoneButton = styled.button`
  background-color: #fc8003;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border: 0;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  gap: 5px;
  svg {
    width: 15px;
  }
`;

const Input = styled.input`
  font-size: 16px;
  padding-right: 10px;
  border-radius: 50px;
  border: none;
  width: 100%;
`;

// 작성한 트윗 내용 화면에 추가, 삭제

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  // ITweet을 만족하는 username, photo, tweet를 받음
  // 자기가 작성한 트윗만 삭제할 수 있도록 만들고 싶음
  // 접속한 유저의 아이디와 트윗의 아이디가 같은지 확인한 뒤 버튼 생성
  const user = auth.currentUser; // 현재 접속한 유저확인
  const [edit, setEdit] = useState(false);
  const [changedTweet, setChangedTweet] = useState("");

  const onDelete = async () => {
    // 트윗 삭제
    const ok = confirm("이 트윗을 정말로 삭제하시겠습니까?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id)); // 문서를 삭제하는 firebase함수
      if (photo) {
        // 업로드된 이미지가 있는지 먼저 확인
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef); // 스토리지 내 주소에 위치한 이미지를 삭제하는 firebase함수
      }
    } catch (e) {
      console.log(e);
    } finally {
      //
    }
  };

  const onEdit = () => {
    // Edit 버튼 클릭시 편집 모드
    setEdit(true);
  };

  const onSubmit = async () => {
    // 새로 작성한 내용을 업데이트
    await updateDoc(doc(db, "tweets", id), {
      tweet: changedTweet,
    });
    setEdit(false);
  };

  const onChangeTweet = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 타입스크립트는 이벤트 타입을 명시해줘야함
    setChangedTweet(e.target.value); // 사용자가 입력한 값을 changedTweet에 저장
  };

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <Payload>
          {edit ? (
            <Input value={changedTweet} onChange={onChangeTweet} />
          ) : (
            tweet
          )}
        </Payload>
        {user?.uid === userId ? (
          <Container>
            <DeleteButton onClick={onDelete}>
              Delete
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.515 10.674a1.875 1.875 0 0 0 0 2.652L8.89 19.7c.352.351.829.549 1.326.549H19.5a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-9.284c-.497 0-.974.198-1.326.55l-6.375 6.374ZM12.53 9.22a.75.75 0 1 0-1.06 1.06L13.19 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L15.31 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z"
                  clip-rule="evenodd"
                />
              </svg>
            </DeleteButton>
            {edit ? (
              <DoneButton onClick={onSubmit}>
                Done
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </DoneButton>
            ) : (
              <EditButton onClick={onEdit}>
                Edit
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                  <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                </svg>
              </EditButton>
            )}
          </Container>
        ) : null}
      </Column>
      <Column>{photo ? <Photo src={photo} /> : null}</Column>
    </Wrapper>
  );
}

// 코드챌린지 - 자기가 만든 트윗을 edit할 수 있는 버튼 추가, 사진 추가 삭제
