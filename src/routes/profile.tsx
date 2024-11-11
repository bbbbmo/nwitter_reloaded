import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer; // 버튼처럼 보이게
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
`;

const AvatarInput = styled.input`
  display: none;
`;

const Container = styled.div`
  display: flex;
  gap: 5px;
`;

const Name = styled.span`
  font-size: 22px;
  flex-direction: column;
  gap: 10px;
`;

const EditName = styled.span`
  width: 22px;
  color: #1d9bf0;
  cursor: pointer;
  &:hover {
    transform: scale(1.1);
  }
`;

const Tweets = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;

export default function Profile() {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [tweets, setTweets] = useState<ITweet[]>([]); // 배열로 호출되는 인터페이스를 가짐
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("clicked");
    const { files } = e.target;
    if (!user) return;
    if (files && files.length === 1) {
      // 유저가 있다면
      const file = files[0];
      const locationRef = ref(storage, `avatars/${user?.uid}`); // avatars라는 폴더에 유저 ID로 사진을 업로드, 유저 ID를 사용하면 새 이미지 업로드 시 덮어쓰기 가능
      const result = await uploadBytes(locationRef, file);
      const avatarUrl = await getDownloadURL(result.ref);
      setAvatar(avatarUrl);
      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };
  const fetchTweets = async () => {
    const tweetQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid), // 필터의 역할, 이것을 firestore에 알리지 않으면 오류 발생->콘솔 오류에서 링크를 따라간 뒤 색인 추가, 저장 클릭
      orderBy("createdAt", "desc"),
      limit(25)
    ); // 현재 유저와 아이디가 같다면 그 유저의 트위을 가져옴, 최신순부터, 25개 제한으로
    const snapshot = await getDocs(tweetQuery);
    const tweets = snapshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo } = doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username,
        photo,
        id: doc.id, // id 값은 필드의 상위인 문서에 있음
      };
    });
    setTweets(tweets);
  };
  useEffect(() => {
    fetchTweets();
  }, []);
  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {avatar ? (
          <AvatarImg src={avatar} />
        ) : (
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
          </svg>
        )}
      </AvatarUpload>
      <AvatarInput
        onChange={onAvatarChange}
        id="avatar"
        type="file"
        accept="image/*"
      />
      <Container>
        <Name>{user?.displayName ?? "Anonymous"}</Name>
        <EditName>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
          </svg>
        </EditName>
      </Container>
      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
} //??연산자는 왼쪽 피연산자가 null이나 undefined일 경우에만 오른쪽 피연산자를 반환. 만약 왼쪽 피연산자가 null이나 undefined가 아닌 다른 값이라면, 그 값을 그대로 반환.
