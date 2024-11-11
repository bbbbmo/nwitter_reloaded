import {
  GithubAuthProvider,
  //sendPasswordResetEmail,
  signInWithPopup,
} from "firebase/auth";
import styled from "styled-components";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

// 깃허브로 로그인하는 모듈

const Button = styled.span`
  background-color: white;
  margin-top: 50px;
  font-weight: 500;
  width: 100%;
  color: black;
  padding: 10px 20px;
  border-radius: 50px;
  border: 0;
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.image`
  height: 25px;
`;

export default function GithubButton() {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider); // 팝업창으로 로그인
      // await signInWithRedirect(auth, provider); // 새창으로 로그인
      // 이때 이미 사용한 이메일을 이용해 깃허브로 로그인 시도 시 에러 발생
      navigate("/");
      //sendPasswordResetEmail();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Button onClick={onClick}>
      <Logo href="../public/github-logo.svg" />
      Continue with Github
    </Button>
  );
}
