"use client";
import Header from "../header/header";
import BodyHomePage from "./bodyHomePage";
import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
const HomePage: React.FC = () => {

  
    const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && !session) {
      router.push("/");
    }
  }, [session, router]);
  return (
    <div className="background_color">
      <Header />
      <section className="p-14">
        <BodyHomePage />
      </section>
    </div>
  );
};

export default HomePage;
