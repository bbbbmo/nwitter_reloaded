import {
  collection,
  limit,
  //getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../firebase";
import Tweet from "./tweet";
import { Unsubscribe } from "firebase/auth";

export interface ITweet {
  // interface는 TypeScript에서 사용되는 예약어로, 객체의 구조를 정의하는 데 사용됩니다. 인터페이스는 특정 객체가 가져야 하는 속성들과 그들의 타입을 정의하여, 코드의 타입 안정성을 높이고, 특정 구조를 따르도록 강제하는 데 매우 유용합니다.
  id: string;
  photo?: string; // photo는 필수값 아님, 사진을 올리지 않을 수도 있기 때문
  tweet: string;
  userId: string;
  username: string;
  createdAt: number;
}

const Wrapper = styled.div`
  display: grid;
  gap: 10px;
  flex-direction: column;
  overflow-y: scroll;
`;

export default function Timeline() {
  const [tweets, setTweet] = useState<ITweet[]>([]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null; //unsubscribe의 값은 Unsubscribe이거나 null이고 초기에는 null
    const fetchTweets = async () => {
      const tweetsQuery = query(
        collection(db, "tweets"),
        orderBy("createdAt", "desc"), // 트윗을 게시한 시간 순(최신)으로 나열
        limit(25) // 트윗을 25개만 불러옴
      );
      /*   const snapshot = await getDocs(tweetsQuery); // getDocs는 QuerySnapshot을 반환
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
      });  */ // 쿼리에서 반환된 문서 내부의 데이터(ITTweet을 만족하는)를 추출하고 tweet에 객체로 저장
      unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
        // 문서를 한번만 가져오는 대신 리스너를 추가해 무언가 변경사항이 있으면 해당 쿼리의 문서를 보며 필요한 데이터 추출 -> 실시간으로 화면에 새로고침없이 반영
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
        setTweet(tweets);
      }); // 이벤트 리스너를 연결, getDocs를 쓰는 대신 이것을 사용, 하지만 계속 쓰면 비용이 발생해 구독 취소해야함
    };
    fetchTweets();
    return () => {
      // 옵셔널 체이닝 사용
      unsubscribe?.();
    }; // useEffect(clean up)를 사용해 유저가 다른 화면에 있을 때 이 함수 호출해 이벤트를 받지않음
  }, []);
  return (
    <Wrapper>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} /> // ...은 배열 tweet의 모든 요소를 펼침
      ))}
    </Wrapper>
  );
}
