import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

// 로그인한 경우 이 페이지, 로그인 하지 않은 경우는 로그인 페이지로 가게 함
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState(auth.currentUser); // 유저가 로그인 했는지 여부를 알려줌, 로그인 되어있는 user의 값 또는 null
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      // 유저의 회원가입 여부를 관찰
      setUser(authUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  if (user === null) {
    // user가 null이라면
    return <Navigate to="/login" />;
  }
  return children; // 로그인 했다면 ProtectedRoute의 하위 페이지(Layout)로 가게함
}
