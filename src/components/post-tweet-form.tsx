import { addDoc, collection, updateDoc } from "firebase/firestore";
import { useState } from "react";
import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

// : (콜론 하나): 가상 클래스로, 요소의 특정 상태를 선택합니다. (:hover, :focus, :nth-child 등)
// :: (콜론 두 개): 가상 요소로, 요소의 특정 부분을 스타일링하거나 새로운 가상의 부분을 선택합니다. (::before, ::after, ::placeholder 등)

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: #111012;
  background-color: white;
  resize: none; // textarea는 기본적으로 유저가 크기를 조절할 수 있음 <- 이것을 방지
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &::placeholder {
    // 현재 textarea의 placeholder의 css를 중복 설정
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;

const AttachFileButton = styled.label`
  padding: 10px 0px;
  color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer; // 요소에 마우스를 올렸을 때 커서 모양을 변경하는 속성
`;

const AttachFileInput = styled.input`
  display: none;
`;

const SubmitButton = styled.input`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9; // 불투명도 설정
  }
`;

// 트윗을 업로드하는 기능을 가진 모듈

export default function PostTweetForm() {
  // accept 속성은 HTML <input> 요소에서 **파일 입력 필드 (type="file")**에 사용되며, 사용자가 업로드할 수 있는 파일의 MIME 타입 또는 파일 확장자를 제한하는 데 사용
  // htmlFor은 label과 특정 폼 컨트롤을 연결하여 라벨을 클릭했을 때 해당 폼 요소가 선택되거나 포커스될 수 있도록 합니다.
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const FILE_SIZE = 1 * 1024 * 1024; // 요구 파일 사이즈, 파일크기를 바이트 단위로 제공하므로 MB로 변환
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(e.target.value);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target; // 파일이 하나인지 확인, **?.**는 옵셔널 체이닝(optional chaining) 연산자로, 특정 객체가 존재할 때만 접근하려는 속성에 접근할 수 있도록 합니다. 이 구문은 파일 입력과 관련된 이벤트 핸들러에서 자주 사용되며, 예를 들어 파일이 선택된 경우 그 파일 데이터를 추출합니다.
    if (files && files.length == 1 && files[0].size < FILE_SIZE) {
      // 이것을 1MB 미만의 파일만 업로드 할 수 있게 수정해야함
      // input의 type="file" 속성은 복수의 파일 업로드 가능, 하나의 파일만 업로드하려함
      setFile(files[0]);
    }
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || tweet === "" || tweet.length > 180) {
      return;
    }
    try {
      setLoading(true);
      const doc = await addDoc(collection(db, "tweets"), {
        // 파이어베이스의 데이터베이스(Document인 "tweets")에 데이터 삽입하는 함수
        tweet,
        createdAt: Date.now(),
        username: user.displayName || "Anonymous",
        userId: user.uid, // 트윗을 삭제할 때 작성한 유저와 같은지 확인하기 위해
      });
      if (file) {
        // 파일이 업로드된다면 위치에 대한 reference를 받음, 왜? 파일을 삭제하거나 메타데이터를 가져오거나 업데이트 하기 위해
        const locationRef = ref(
          storage,
          `tweets/${user.uid}-${user.displayName}/${doc.id}`
        ); // 업로드된 파일의 위치(url)를 지정할 수 있음
        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref); // string을 반환하는 promise, 업로드된 이미지의 url을 만들어줌
        await updateDoc(doc, {
          photo: url, // 이미지의 url을 doc에 추가
        });
      }
      setTweet("");
      setFile(null);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form onSubmit={onSubmit}>
      <TextArea
        rows={5}
        maxLength={180}
        onChange={onChange}
        value={tweet}
        placeholder="What is happening?"
        required
      />
      <AttachFileButton htmlFor="file">
        {file ? "Photo added✅" : "Add Photo"}
      </AttachFileButton>
      <AttachFileInput
        onChange={onFileChange}
        id="file"
        type="file"
        accept="image/*"
      />
      <SubmitButton
        type="submit"
        value={isLoading ? "Posting..." : "Post Tweet"}
      />
    </Form>
  );
}
