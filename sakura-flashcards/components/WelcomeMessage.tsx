"use client";

import Link from "next/link";
import { useContext } from "react";
import UserContext from "./UserContext";

const WelcomeMessage = () => {
  const { userName } = useContext(UserContext);

  return (
    <div>
      <h1 className="text-4xl font-bold">Sakura Flashcards</h1>
      <p className="mt-3 md:text-lg">
        Welcome {userName ? userName : ""} to Sakura Flashcards, your ultimate
        study companion for mastering Japanese! Designed to align seamlessly
        with the{" "}
        <span>
          <Link
            href="https://genki3.japantimes.co.jp/en/"
            className="text-violet-400 hover:text-violet-300 hover:underline"
          >
            Genki: An Integrated Course in Elementary Japanese (Third Edition)
          </Link>
        </span>{" "}
        textbooks, our exercises are tailored to reinforce your understanding
        and retention of each lesson's material. Simply navigate to any lesson
        and select the exercise you'd like to tackle. Dive in, challenge
        yourself, and watch your Japanese skills soar! Happy studying!
      </p>
    </div>
  );
};

export default WelcomeMessage;
