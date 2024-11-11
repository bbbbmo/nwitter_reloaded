import styled from "styled-components";
import PostTweetForm from "../components/post-tweet-form";
import Timeline from "../components/timeline";

const Wrapper = styled.div`
  display: grid;
  gap: 50px;
  overflow-y: scroll; // 콘텐츠가 요소의 높이를 초과할 경우 스크롤을 제공하여 사용자가 모든 내용을 볼 수 있도록 만듦, 또한 넘치지 않더라도 기본적으로 스크롤바 항상 표시
  grid-template-rows: 1fr 5fr;
`;

export default function Home() {
  return (
    <Wrapper>
      <PostTweetForm />
      <Timeline />
    </Wrapper>
  );
}
