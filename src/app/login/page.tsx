"use client";

import { LoginView } from "@/components/auth/LoginView";
import { useWardrobe } from "@/context/WardrobeContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function LoginPage() {
  const { isAuthenticated } = useWardrobe();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  return <LoginView />;
}
